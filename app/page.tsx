import MainPage from "@/components/main/index";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.JSX.Element> {
  const params = await searchParams;
  const auth = params.auth;

  return <MainPage authOpen={auth === "1"} />;
}
