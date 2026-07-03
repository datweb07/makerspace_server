import type { CreateProductInput, Product } from "../schemaValidation/products.schema";

const productsStore: Product[] = [
  {
    id: 1,
    name: "Bản đồ gỗ UEH Mekong",
    category: "Bản đồ & Nghệ thuật",
    material: "Gỗ Plywood khắc laser",
    price: "Liên hệ",
    description: "Bản đồ vùng Mekong Delta khắc laser chi tiết. Dùng trang trí văn phòng, sảnh đón tiếp.",
    image: "https://images.unsplash.com/photo-1619759247130-4e7a70f2fe27?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Khối gỗ 17 SDGs",
    category: "Bản đồ & Nghệ thuật",
    material: "Gỗ Óc Chó, sơn khắc",
    price: "Liên hệ",
    description: "Bộ 17 khối gỗ mô phỏng 17 Mục tiêu Phát triển Bền vững của Liên Hợp Quốc.",
    image: "https://images.unsplash.com/photo-1631396326870-da00e37a9fc6?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Bộ cờ vua gỗ Dẻ Gai",
    category: "Trò chơi & Giải trí",
    material: "Gỗ Dẻ Gai nguyên khối",
    price: "1.800.000đ",
    description: "Cờ vua thủ công từ gỗ Dẻ Gai. Bàn cờ và quân cờ tiện/CNC chính xác.",
    image: "https://images.unsplash.com/photo-1611117775350-ac3950990985?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Cờ vua Resin nghệ thuật",
    category: "Trò chơi & Giải trí",
    material: "Epoxy Resin + Gỗ Óc Chó",
    price: "2.500.000đ",
    description: "Bàn cờ vua đúc Resin trong suốt, kết hợp gỗ Óc Chó. Thiết kế theo yêu cầu.",
    image: "https://images.unsplash.com/photo-1586296835409-fe3fe6b35b56?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Đèn bàn gỗ khắc laser",
    category: "Đèn & Decor",
    material: "Gỗ Plywood, LED ấm",
    price: "350.000đ",
    description: "Đèn ngủ/bàn khắc laser hoa văn tùy chọn. Ánh sáng LED ấm 3000K, dimmer.",
    image: "https://images.unsplash.com/photo-1576595580361-90a855b84b20?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Cúp & Kỷ niệm chương",
    category: "Quà tặng Doanh nghiệp",
    material: "Gỗ + Kim loại mạ đồng",
    price: "Liên hệ",
    description: "Cúp trao giải và kỷ niệm chương theo yêu cầu. Khắc tên, logo, nội dung riêng.",
    image: "https://images.unsplash.com/photo-1611021061285-16c871740efa?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 7,
    name: "Mô hình nhà gỗ kiến trúc",
    category: "Quà tặng Doanh nghiệp",
    material: "Balsa Wood, Plywood",
    price: "Liên hệ",
    description: "Mô hình kiến trúc tỉ lệ 1:50 đến 1:200. Phục vụ triển lãm, trình bày dự án.",
    image: "https://images.unsplash.com/photo-1679797850019-3d0d8659a695?w=400&h=300&fit=crop&auto=format",
  },
  {
    id: 8,
    name: "Bảng Signage gỗ khắc laser",
    category: "Signage",
    material: "Plywood khắc laser + sơn",
    price: "Liên hệ",
    description: "Biển tên phòng, bảng chào, signage không gian. Thiết kế theo bộ nhận diện thương hiệu.",
    image: "https://images.unsplash.com/photo-1615286922420-c6b348ffbd62?w=400&h=300&fit=crop&auto=format",
  },
];

export const productsModel = {
  list() {
    return productsStore;
  },
  listCategories() {
    return [...new Set(productsStore.map((product) => product.category))];
  },
  findById(id: number) {
    return productsStore.find((product) => product.id === id) ?? null;
  },
  create(input: CreateProductInput) {
    const nextProduct: Product = {
      ...input,
      id: productsStore.length + 1,
    };

    productsStore.push(nextProduct);
    return nextProduct;
  },
};
