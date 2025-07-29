import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const body = await req.text();
    console.log(body)
  const books = await prisma.book.findMany({
    // where: {
    //   ownerId: user.id
    // }
  });

  return new Response(JSON.stringify(books), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
