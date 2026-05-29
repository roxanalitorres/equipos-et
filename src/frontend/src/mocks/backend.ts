import type { backendInterface } from "../backend";
import {
  Branch,
  DocumentStatus,
  DocumentType,
  Role,
  StockAdjustmentReason,
  UserRole,
} from "../backend";
import type { Principal } from "@icp-sdk/core/principal";

const mockPrincipal = { _arr: new Uint8Array([1, 2, 3]), toText: () => "aaaaa-aa" } as unknown as Principal;

const mockProducts = [
  {
    id: BigInt(1),
    partNumber: "CAT-1R-0749",
    supplierName: "Caterpillar Inc.",
    supplierPartNumber: "1R-0749",
    name: "Filtro de aceite CAT",
    description: "Filtro de aceite para motor Caterpillar serie 3306",
    costPrice: 45.0,
    marginPercent: 35,
    minStockAlert: BigInt(5),
    createdAt: BigInt(Date.now() * 1000000),
    updatedAt: BigInt(Date.now() * 1000000),
  },
  {
    id: BigInt(2),
    partNumber: "KOM-600-211-1231",
    supplierName: "Komatsu America",
    supplierPartNumber: "600-211-1231",
    name: "Filtro combustible Komatsu",
    description: "Filtro de combustible para excavadora PC200",
    costPrice: 38.5,
    marginPercent: 40,
    minStockAlert: BigInt(3),
    createdAt: BigInt(Date.now() * 1000000),
    updatedAt: BigInt(Date.now() * 1000000),
  },
  {
    id: BigInt(3),
    partNumber: "CAT-4P-2839",
    supplierName: "Caterpillar Inc.",
    supplierPartNumber: "4P-2839",
    name: "Correa dentada CAT D6",
    description: "Correa dentada para tractor de cadenas D6",
    costPrice: 120.0,
    marginPercent: 30,
    minStockAlert: BigInt(2),
    createdAt: BigInt(Date.now() * 1000000),
    updatedAt: BigInt(Date.now() * 1000000),
  },
];

const mockCustomers = [
  {
    id: BigInt(1),
    name: "Constructora Amazónica S.A.",
    taxId: "1792345678001",
    email: "compras@constructoramazonica.ec",
    phone: "+593 3 288-4500",
  },
  {
    id: BigInt(2),
    name: "Petroecuador EP",
    taxId: "1760001550001",
    email: "proveedores@petroecuador.ec",
    phone: "+593 2 256-7890",
  },
];

const mockDocuments = [
  {
    id: BigInt(1),
    documentNumber: "FAC-2024-001",
    docType: DocumentType.Invoice,
    status: DocumentStatus.Confirmed,
    customerId: BigInt(1),
    customerName: "Constructora Amazónica S.A.",
    items: [
      {
        productId: BigInt(1),
        partNumber: "CAT-1R-0749",
        name: "Filtro de aceite CAT",
        quantity: BigInt(10),
        unitPrice: 60.75,
        subtotal: 607.5,
      },
    ],
    subtotal: 607.5,
    taxPercent: 15,
    taxAmount: 91.13,
    total: 698.63,
    createdAt: BigInt(Date.now() * 1000000),
    createdBy: mockPrincipal,
  },
  {
    id: BigInt(2),
    documentNumber: "PRF-2024-012",
    docType: DocumentType.Proforma,
    status: DocumentStatus.Draft,
    customerId: BigInt(2),
    customerName: "Petroecuador EP",
    items: [
      {
        productId: BigInt(2),
        partNumber: "KOM-600-211-1231",
        name: "Filtro combustible Komatsu",
        quantity: BigInt(5),
        unitPrice: 53.9,
        subtotal: 269.5,
      },
    ],
    subtotal: 269.5,
    taxPercent: 15,
    taxAmount: 40.43,
    total: 309.93,
    createdAt: BigInt(Date.now() * 1000000),
    createdBy: mockPrincipal,
  },
];

const mockLocations = [
  {
    productId: BigInt(1),
    branch: Branch.Puyo,
    quantity: BigInt(2),
    locationLabel: "Vitrina A - Fila 3",
    updatedAt: BigInt(Date.now() * 1000000),
  },
  {
    productId: BigInt(2),
    branch: Branch.El_Topo,
    quantity: BigInt(8),
    locationLabel: "Estante B - Col 2",
    updatedAt: BigInt(Date.now() * 1000000),
  },
  {
    productId: BigInt(3),
    branch: Branch.Puyo,
    quantity: BigInt(1),
    locationLabel: "Bodega - Fila 1",
    updatedAt: BigInt(Date.now() * 1000000),
  },
];

const mockLowStockItems = [
  {
    productId: BigInt(1),
    partNumber: "CAT-1R-0749",
    name: "Filtro de aceite CAT",
    branch: Branch.Puyo,
    quantity: BigInt(2),
    minStockAlert: BigInt(5),
  },
  {
    productId: BigInt(3),
    partNumber: "CAT-4P-2839",
    name: "Correa dentada CAT D6",
    branch: Branch.Puyo,
    quantity: BigInt(1),
    minStockAlert: BigInt(2),
  },
];

const mockUserProfile = {
  principal: mockPrincipal,
  name: "Edgar Ramírez",
  role: Role.Admin,
  branch: Branch.Puyo,
  active: true,
  createdAt: BigInt(Date.now() * 1000000),
};

export const mockBackend: backendInterface = {
  _initializeAccessControl: async () => undefined,
  addStock: async () => undefined,
  assignCallerUserRole: async () => undefined,
  cancelDocument: async () => true,
  confirmDocument: async () => true,
  convertProformaToInvoice: async () => mockDocuments[0],
  createCustomer: async (input) => ({ id: BigInt(99), ...input }),
  createInvoice: async () => mockDocuments[0],
  createProduct: async (input) => ({ id: BigInt(99), createdAt: BigInt(0), updatedAt: BigInt(0), ...input }),
  createProforma: async () => mockDocuments[1],
  deleteProduct: async () => true,
  getCallerUserProfile: async () => mockUserProfile,
  getCallerUserRole: async () => UserRole.admin,
  getCustomer: async () => mockCustomers[0],
  getDocument: async () => mockDocuments[0],
  getLowStockItems: async () => mockLowStockItems,
  getProduct: async () => mockProducts[0],
  getUserProfile: async () => mockUserProfile,
  isCallerAdmin: async () => true,
  listAllUsers: async () => [mockUserProfile],
  listCustomers: async () => mockCustomers,
  listDocuments: async () => mockDocuments,
  listLocationsByBranch: async () => mockLocations,
  listLocationsByProduct: async () => mockLocations.slice(0, 1),
  listProducts: async () => mockProducts,
  removeStock: async () => undefined,
  saveCallerUserProfile: async () => undefined,
  searchProducts: async () => mockProducts,
  setUserActive: async () => undefined,
  setUserRole: async () => undefined,
  updateCustomer: async () => mockCustomers[0],
  updateProduct: async () => mockProducts[0],
  listServices: async () => [],
  createService: async (input) => ({ id: BigInt(1), code: 'SRV-001', description: input.description, price: input.price }),
  getService: async () => null,
  searchServices: async () => [],
};
