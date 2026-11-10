import { clip } from "versioncam";

export default clip("01-say-hello", { title: "Say hello" }, async (s) => {
  await s.open("/");
  s.caption("Say hello");
  await s.hold(1500);

  await s.typeInto(s.byTestId("name"), "Mira Halloran");
  await s.hold(400);
  await s.click(s.byTestId("save"));
  await s.settle({ label: "greeted" });

  s.highlight(s.byTestId("result"), "ring", { for: 2000 });
  await s.hold(2500);
});
