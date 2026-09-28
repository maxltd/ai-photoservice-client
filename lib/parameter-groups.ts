import type { ParameterGroupRequest } from '@/lib/api/contract';

export interface LocalParameterOption {
  localId: string;
  label: string;
  promptSnippet: string;
  imageUrl?: string;
}

export interface LocalParameterGroup {
  localId: string;
  question: string;
  isRequired: boolean;
  options: LocalParameterOption[];
}

export function createEmptyOption(): LocalParameterOption {
  return {
    localId: crypto.randomUUID(),
    label: '',
    promptSnippet: '',
    imageUrl: '',
  };
}

export function createEmptyGroup(): LocalParameterGroup {
  return {
    localId: crypto.randomUUID(),
    question: '',
    isRequired: true,
    options: [createEmptyOption()],
  };
}

export function cloneOption(option: LocalParameterOption): LocalParameterOption {
  return {
    ...option,
    localId: crypto.randomUUID(),
  };
}

export function cloneGroup(group: LocalParameterGroup): LocalParameterGroup {
  return {
    ...group,
    localId: crypto.randomUUID(),
    options: group.options.map((option) => cloneOption(option)),
  };
}

export function serializeParameterGroups(groups: LocalParameterGroup[]): ParameterGroupRequest[] {
  return groups.map((group, groupIndex) => ({
    question: group.question,
    isRequired: group.isRequired,
    sortOrder: groupIndex,
    options: group.options.map((option, optionIndex) => ({
      label: option.label,
      promptSnippet: option.promptSnippet,
      imageUrl: option.imageUrl || undefined,
      sortOrder: optionIndex,
    })),
  }));
}

export function buildPreviewPrompt(
  basePrompt: string,
  parameterGroups: LocalParameterGroup[],
  selectedOptionByGroup: Record<string, number>,
): string {
  const snippets = parameterGroups
    .map((group) => {
      const selectedIndex = selectedOptionByGroup[group.localId] ?? 0;
      return group.options[selectedIndex]?.promptSnippet ?? '';
    })
    .map((snippet) => snippet.trim())
    .filter((snippet) => snippet.length > 0);

  return [basePrompt.trim(), ...snippets]
    .filter((part) => part.length > 0)
    .join(' ')
    .trim();
}

export function hasEmptyGroups(groups: LocalParameterGroup[]): boolean {
  return groups.some((group) => group.options.length === 0);
}
