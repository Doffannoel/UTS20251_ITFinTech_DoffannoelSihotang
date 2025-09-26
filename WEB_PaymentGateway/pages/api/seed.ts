import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDB();

  const products = [
    {
      name: "Air Force 1",
      slug: "airForce1",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/airForce1.webp",
      images: [
        "/images/products/airForce1.webp",
        "/images/shots/shot2.webp",
        "/images/shots/shot3.jpeg",
        "/images/shots/shot4.jpeg",
        "/images/shots/shot5.webp",
        "/images/shots/shot6.jpeg",
        "/images/shots/shot7.webp",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: false,
    },
    {
      name: "Lebron Black",
      slug: "blackLebron",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/blackLebron.webp",
      images: [
        "/images/products/blackLebron.webp",
        "/images/shots/shotlebron1.avif",
        "/images/shots/shotlebron2.avif",
        "/images/shots/shotlebron3.avif",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: true,
    },
    {
      name: "SB Low Brown",
      slug: "brownsb",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/brownsb.webp",
      images: [
        "/images/products/brownsb.webp",
        "/images/shots/shotlowbron1.webp",
        "/images/shots/shotlowbron2.webp",
        "/images/shots/shotlowbron3.webp",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: false,
    },
    {
      name: "BRSB",
      slug: "brsb",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/brsb.webp",
      images: [
        "/images/products/brsb.webp",
        "/images/shots/shotbrsb1.avif",
        "/images/shots/shotbrsb2.avif",
        "/images/shots/shotbrsb3.avif",
        "/images/shots/shotbrsb4.avif",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: false,
    },
    {
      name: "Dunk Low",
      slug: "dunklow",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/dunklow.webp",
      images: [
        "/images/products/dunklow.webp",
        "/images/shots/shotdunk1.avif",
        "/images/shots/shotdunk2.avif",
        "/images/shots/shotdunk3.avif",
        "/images/shots/shotdunk4.avif",
        "/images/shots/shotdunk4.avif",
        "/images/shots/shotdunk5.avif",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: false,
    },
    {
      name: "Lebron XXL",
      slug: "lebronxx",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/lebronxx.webp",
      images: [
        "/images/products/lebronxx.webp",
        "/images/shots/lebron1.webp",
        "/images/shots/lebron2.webp",
        "/images/shots/lebron3.webp",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: false,
    },
    {
      name: "Metcon 5",
      slug: "metcon5",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/metcon5.webp",
      images: [
        "/images/shots/shot1.webp",
        "/images/shots/shot2.webp",
        "/images/shots/shot3.jpeg",
        "/images/shots/shot4.jpeg",
        "/images/shots/shot5.webp",
        "/images/shots/shot6.jpeg",
        "/images/shots/shot7.webp",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: true,
    },
    {
      name: "Metcon 9",
      slug: "metcon9",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/metcon9.webp",
      images: [
        "/images/products/metcon9.webp",
        "/images/shots/metcon1.jpp",
        "/images/shots/metcon2.jpp",
        "/images/shots/metcon3.jpp",
        "/images/shots/metcon4.jpp",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: false,
    },
    {
      name: "Nike Blazer",
      slug: "nike_blazer",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/nike_blazer.webp",
      images: [
        "/images/products/nike_blazer.webp",
        "/images/shots/blazer1.avif",
        "/images/shots/blazer2.avif",
        "/images/shots/blazer3.avif",
        "/images/shots/blazer4.avif",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.7,
      justIn: true,
    },
    {
      name: "Dunk Low Red",
      slug: "redlow",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/redlow.webp",
      images: [
        "/images/products/redlow.webp",
        "/images/shots/dunklow1.avif",
        "/images/shots/dunklow2.avif",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.5,
      justIn: false,
    },
    {
      name: "Slides",
      slug: "slides",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/slides.webp",
      images: ["/images/products/slides.webp"],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.9,
      justIn: false,
    },
    {
      name: "Dunk Low Yellow",
      slug: "yellowLow",
      price: Math.floor(Math.random() * (3500000 - 800000 + 1)) + 800000,
      image: "/images/products/yellowLow.webp",
      images: [
        "/images/products/yellowLow.webp",
        "/images/shots/dunkyellow1.jpg",
        "/images/shots/dunkyellow2.jpg",
        "/images/shots/dunkyellow3.jpg",
      ],
      overview:
        "When your workouts wade into the nitty gritty, the Nike Free Metcon 5 can meet you in the depths, help you dig deep to find that final ounce of force and come out of the other side on a high. It matches style with substance, forefoot flexibility with backend stability, perfect for flying through a cardio day or enhancing your agility. A revamped upper offers easier entry with a collar made just for your ankle.",
      category: "Men's shoes",
      rating: 4.8,
      justIn: true,
    },
  ];

  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    return res.status(200).json({ message: "Seeded", count: products.length });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
