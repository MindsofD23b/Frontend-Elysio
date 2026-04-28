import { GAP, H_SCALE } from "./homeConstants";

export const images = [
    // left column
    {
        id: "l1",
        col: "left",
        uri: "https://images.unsplash.com/photo-1591969851586-adbbd4accf81?q=80&w=687&auto=format&fit=crop",
        h: 150,
    },
    {
        id: "l2",
        col: "left",
        uri: "https://images.unsplash.com/photo-1525206809752-65312b959c88?q=80&w=687&auto=format&fit=crop",
        h: 220,
    },
    {
        id: "l3",
        col: "left",
        uri: "https://images.unsplash.com/photo-1566759996874-04d713cc224a?q=80&w=687&auto=format&fit=crop",
        h: 160,
    },
    {
        id: "l4",
        col: "left",
        uri: "https://images.unsplash.com/photo-1541679368093-5c967ac6de11?q=80&w=687&auto=format&fit=crop",
        h: 210,
    },
    {
        id: "l5",
        col: "left",
        uri: "https://images.unsplash.com/photo-1510276113764-7ac28415a9ec?q=80&w=1170&auto=format&fit=crop",
        h: 180,
    },
    {
        id: "l6",
        col: "left",
        uri: "https://images.unsplash.com/photo-1469989011449-f7b46079781c?q=80&w=687&auto=format&fit=crop",
        h: 200,
    },
    {
        id: "l7",
        col: "left",
        uri: "https://images.unsplash.com/photo-1501901609772-df0848060b33?q=80&w=687&auto=format&fit=crop",
        h: 170,
    },
    {
        id: "l8",
        col: "left",
        uri: "https://images.unsplash.com/photo-1649289787860-ecad6fad173f?q=80&w=687&auto=format&fit=crop",
        h: 230,
    },
    {
        id: "l9",
        col: "left",
        uri: "https://images.unsplash.com/photo-1591711696773-c4b7fe4d3d74?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        h: 155,
    },
    {
        id: "l10",
        col: "left",
        uri: "https://images.unsplash.com/photo-1512790941078-1158a9cc3255?q=80&w=685&auto=format&fit=crop",
        h: 195,
    },

    // right column
    {
        id: "r1",
        col: "right",
        uri: "https://images.unsplash.com/photo-1622503958522-9f847e7e18de?q=80&w=687&auto=format&fit=crop",
        h: 180,
    },
    {
        id: "r2",
        col: "right",
        uri: "https://images.unsplash.com/photo-1513521523607-ba30a1159755?q=80&w=1170&auto=format&fit=crop",
        h: 140,
    },
    {
        id: "r3",
        col: "right",
        uri: "https://images.unsplash.com/photo-1624228652393-eab1721b1899?q=80&w=687&auto=format&fit=crop",
        h: 240,
    },
    {
        id: "r4",
        col: "right",
        uri: "https://images.unsplash.com/photo-1481689481678-374244adae6d?q=80&w=687&auto=format&fit=crop",
        h: 120,
    },
    {
        id: "r5",
        col: "right",
        uri: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=687&auto=format&fit=crop",
        h: 200,
    },
    {
        id: "r6",
        col: "right",
        uri: "https://images.unsplash.com/photo-1580250864656-cd501faa9c76?q=80&w=687&auto=format&fit=crop",
        h: 160,
    },
    {
        id: "r7",
        col: "right",
        uri: "https://images.unsplash.com/photo-1513521465117-afd07b1ce6dc?q=80&w=687&auto=format&fit=crop",
        h: 210,
    },
    {
        id: "r8",
        col: "right",
        uri: "https://images.unsplash.com/photo-1561240055-102e7eaa2961?q=80&w=687&auto=format&fit=crop",
        h: 175,
    },
    {
        id: "r9",
        col: "right",
        uri: "https://images.unsplash.com/photo-1567888818950-737cde12f04c?q=80&w=687&auto=format&fit=crop",
        h: 145,
    },
    {
        id: "r10",
        col: "right",
        uri: "https://images.unsplash.com/photo-1611067460204-e43ec4a2efa3?q=80&w=1170&auto=format&fit=crop",
        h: 220,
    },
];

export type HomeImage = (typeof images)[number];

export function calcColHeight(imgs: HomeImage[]) {
    return imgs.reduce((sum, img) => sum + Math.round(img.h * H_SCALE) + GAP, 0);
}
