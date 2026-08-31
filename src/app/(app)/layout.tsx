import { BottomNav } from "@/components/bottom-nav";

/** Marco de las secciones con sesion y pareja: contenido + barra inferior. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="pb-nav flex flex-1 flex-col">{children}</div>
      <BottomNav />
    </>
  );
}
