import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  // Validación: Solo permite entrar si el usuario actual es tu cuenta personal de administrador
  if (!session || session.user?.email !== "fariasdaniel197@gmail.com") {
    redirect("/");
  }

  // Consultar todos los usuarios registrados ordenados por fecha
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-black uppercase mb-6 tracking-wider">Panel de Administración - Usuarios Registrados</h1>
      <div className="bg-white border border-zinc-200 rounded-sm shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-black text-white uppercase tracking-wider font-mono">
              <th className="p-4">ID</th>
              <th className="p-4">Nombre</th>
              <th className="p-4">Correo Electrónico</th>
              <th className="p-4">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                <td className="p-4 font-mono text-zinc-500">{user.id}</td>
                <td className="p-4 font-bold text-black">{user.name || "Sin nombre"}</td>
                <td className="p-4 text-zinc-700">{user.email}</td>
                <td className="p-4 text-zinc-500 font-mono">
                  {new Date(user.createdAt).toLocaleDateString()} - {new Date(user.createdAt).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}