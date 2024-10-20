import { OutdatedAlert } from "@/components/atoms/OutdatedAlert";

export default function Introduction() {
  return (
    <section
      className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20"
      data-title="Hi there!"
      data-intro="Welcome to the Developer Sandbox 👋"
      data-step="1"
    >
      {/* <OutdatedAlert /> */}
      <img src="/vvldrizzy-dalle.jpg" alt="VVLDrizzy Logo" width={250} height={250} className="rounded-full"/>
      <br/>
      <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
        VVLDrizzy
      </h1>
      <span
        className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl"
        data-br=":rgm:"
        data-brr="1"
        style={{
          display: "inline-block",
          verticalAlign: "top",
          textDecoration: "inherit",
          maxWidth: "570px",
        }}
      >
        the Viral Video Licensor (VVL)
        <br/>
        <br/>
      </span>
      <h2 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]">Protect your viral videos - and get paid</h2>
    </section>
  );
}
