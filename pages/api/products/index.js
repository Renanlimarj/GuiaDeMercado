import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    const { name, barcode } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    try {
      const product = await prisma.product.create({
        data: {
          name,
          barcode: barcode || null,
        },
      });
      res.status(201).json(product);
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ message: "Product with this barcode already exists" });
      }
      res.status(500).json({ message: "Error creating product" });
    }
  } else if (req.method === "GET") {
    const { search } = req.query;
    try {
      const products = await prisma.product.findMany({
        where: {
          name: {
            contains: search || "",
            mode: "insensitive",
          },
        },
        take: 10,
      });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
