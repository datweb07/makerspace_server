import type { ServiceCatalogItem, ServiceQuoteRequestInput } from "../schemaValidation/services.schema";

const servicesCatalog: ServiceCatalogItem[] = [
  {
    model: "B2B",
    title: "Thiết kế và Sản xuất Prototype",
    description: "Dành cho doanh nghiệp cần nghiên cứu, phát triển sản phẩm. Từ ý tưởng đến mẫu thử hoàn chỉnh với đội ngũ kỹ thuật viên lành nghề.",
    features: [
      "Tư vấn thiết kế sản phẩm (CAD/CAM)",
      "Gia công CNC, cắt laser, in 3D",
      "Sản xuất theo số lượng lớn (SLL)",
      "Đặt hàng quà tặng doanh nghiệp",
      "Báo giá miễn phí trong 24h",
    ],
    cta: "Yêu cầu báo giá",
    ctaPath: "/dang-ky",
    bg: "var(--ueh-dark)",
    fg: "#fff",
  },
  {
    model: "B2C",
    title: "Trải nghiệm Workshop DIY",
    description: "Dành cho cá nhân và gia đình muốn trải nghiệm sáng tạo thủ công. Theo lịch cố định hoặc đặt theo nhóm riêng.",
    features: [
      "Workshop làm nhà chim từ gỗ",
      "Quà tặng lễ: 8/3, 20/10, Noel, Tết",
      "Đèn gỗ DIY, ký tự decor",
      "Đặt lịch theo nhóm từ 5 người",
      "Vật liệu & hướng dẫn đầy đủ",
    ],
    cta: "Đăng ký workshop",
    ctaPath: "/dang-ky",
    bg: "var(--ueh-grey-light)",
    fg: "#111",
  },
  {
    model: "Đào tạo",
    title: "Short Courses và Summer Camp",
    description: "Khóa học ngắn hạn nâng cao kỹ năng thực tiễn cho sinh viên và giảng viên UEH, kết hợp lý thuyết và thực hành.",
    features: [
      "Summer Camp for Children (T6 - T8)",
      "Khóa AutoCAD & SolidWorks cơ bản",
      "Thiết kế sản phẩm 3D Print",
      "Khắc laser nghệ thuật",
      "Chứng nhận hoàn thành từ UEH",
    ],
    cta: "Xem lịch khai giảng",
    ctaPath: "/workshop-cong-dong",
    bg: "#fff",
    fg: "#111",
  },
];

const quoteRequests: ServiceQuoteRequestInput[] = [];

export const servicesModel = {
  listCatalog() {
    return servicesCatalog;
  },
  createQuoteRequest(input: ServiceQuoteRequestInput) {
    quoteRequests.push(input);
    return input;
  },
  listQuoteRequests() {
    return quoteRequests;
  },
};
