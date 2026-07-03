import type { CreateWorkshopRegistrationInput, Workshop } from "../schemaValidation/workshops.schema";

const workshopsStore: Workshop[] = [
  {
    id: 1,
    title: "Workshop Làm nhà chim từ gỗ",
    tag: "DIY",
    date: "15/08/2025",
    time: "8:30 - 11:30",
    slots: 20,
    slotLeft: 7,
    location: "Cơ sở B, UEH",
    price: "150.000đ",
    description: "Học cách cưa, đục, lắp ráp và sơn một ngôi nhà chim nhỏ từ gỗ thông. Phù hợp mọi lứa tuổi, không cần kỹ năng trước.",
    image: "https://images.unsplash.com/photo-1631396326838-de37e5f8bcbc?w=700&h=400&fit=crop&auto=format",
    featured: true,
  },
  {
    id: 2,
    title: "Workshop Quà tặng 20/10 - Đèn gỗ khắc laser",
    tag: "Lễ tết",
    date: "18/10/2025",
    time: "13:30 - 16:30",
    slots: 25,
    slotLeft: 12,
    location: "Cơ sở B, UEH",
    price: "200.000đ",
    description: "Tự tay tạo đèn gỗ khắc laser làm quà tặng ngày 20/10. Vật liệu và thiết kế có sẵn hoặc custom theo ý thích.",
    image: "https://images.unsplash.com/photo-1576595580361-90a855b84b20?w=700&h=400&fit=crop&auto=format",
    featured: true,
  },
  {
    id: 3,
    title: "Summer Camp for Children 2025",
    tag: "Kids",
    date: "07/07/2025 - 25/07/2025",
    time: "8:00 - 11:30 (thứ 2, 4, 6)",
    slots: 30,
    slotLeft: 5,
    location: "Cơ sở B, UEH",
    price: "1.800.000đ / khóa",
    description: "Khóa hè 3 tuần cho trẻ 8-14 tuổi. Học in 3D, làm đồ thủ công, lập trình Scratch và tư duy sáng tạo.",
    image: "https://images.unsplash.com/photo-1631396326870-da00e37a9fc6?w=700&h=400&fit=crop&auto=format",
    featured: true,
  },
  {
    id: 4,
    title: "Khóa AutoCAD cơ bản",
    tag: "Kỹ năng",
    date: "05/09/2025",
    time: "17:30 - 20:30 (thứ 2, 4)",
    slots: 20,
    slotLeft: 15,
    location: "Cơ sở B, UEH",
    price: "800.000đ / 8 buổi",
    description: "Khóa học AutoCAD 2D/3D cơ bản dành cho sinh viên kiến trúc, xây dựng, cơ khí. Tặng chứng nhận UEH.",
    image: "https://images.unsplash.com/photo-1586296835409-fe3fe6b35b56?w=700&h=400&fit=crop&auto=format",
    featured: false,
  },
  {
    id: 5,
    title: 'Triển lãm cộng đồng "Zero Waste Art"',
    tag: "Cộng đồng",
    date: "20/09/2025",
    time: "08:00 - 17:00",
    slots: 200,
    slotLeft: 180,
    location: "Sảnh chính, UEH Cơ sở B",
    price: "Miễn phí",
    description: "Triển lãm tác phẩm nghệ thuật từ vật liệu tái chế của sinh viên UEH. Mở cửa tự do cho cộng đồng.",
    image: "https://images.unsplash.com/photo-1619759247130-4e7a70f2fe27?w=700&h=400&fit=crop&auto=format",
    featured: false,
  },
  {
    id: 6,
    title: "Workshop Quà Noel - Hộp gỗ khắc tên",
    tag: "Lễ tết",
    date: "20/12/2025",
    time: "9:00 - 12:00",
    slots: 20,
    slotLeft: 20,
    location: "Cơ sở B, UEH",
    price: "180.000đ",
    description: "Làm hộp quà Giáng Sinh bằng gỗ, khắc tên người thân, trang trí theo phong cách cổ điển và hiện đại.",
    image: "https://images.unsplash.com/photo-1679797850019-3d0d8659a695?w=700&h=400&fit=crop&auto=format",
    featured: false,
  },
];

const workshopRegistrations: CreateWorkshopRegistrationInput[] = [];

export const workshopsModel = {
  list() {
    return workshopsStore;
  },
  listFeatured() {
    return workshopsStore.filter((workshop) => workshop.featured);
  },
  findById(id: number) {
    return workshopsStore.find((workshop) => workshop.id === id) ?? null;
  },
  createRegistration(input: CreateWorkshopRegistrationInput) {
    workshopRegistrations.push(input);
    return input;
  },
  listRegistrations() {
    return workshopRegistrations;
  },
};
