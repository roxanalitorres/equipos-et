import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import UserTypes "types/users";
import ProductTypes "types/products";
import InvTypes "types/inventory";
import SalesTypes "types/sales";
import Common "types/common";
import InventoryLib "lib/inventory";
import UsersMixin "mixins/users-api";
import ProductsMixin "mixins/products-api";
import InventoryMixin "mixins/inventory-api";
import SalesMixin "mixins/sales-api";
import ServicesMixin "mixins/services-api";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Access control: approved users, pending requests, bootstrap flag
  let approvedUsers = Map.empty<Principal, UserTypes.ApprovedUser>();
  let pendingUsers = Map.empty<Principal, UserTypes.PendingUser>();
  let bootstrapState = { var initialized = false };

  // Users
  let userProfiles = Map.empty<Principal, UserTypes.UserProfile>();
  include UsersMixin(accessControlState, userProfiles, approvedUsers, pendingUsers, bootstrapState);

  // Products
  let products = Map.empty<Common.ProductId, ProductTypes.Product>();
  include ProductsMixin(accessControlState, products, approvedUsers);

  // Inventory
  let locations = Map.empty<InventoryLib.LocationKey, InvTypes.InventoryLocation>();
  let adjustments = List.empty<InvTypes.StockAdjustment>();
  include InventoryMixin(accessControlState, locations, adjustments, products, approvedUsers);

  // Services
  let services = Map.empty<Common.ServiceId, ProductTypes.Service>();
  include ServicesMixin(accessControlState, services, approvedUsers);

  // Sales
  let customers = Map.empty<Common.CustomerId, SalesTypes.Customer>();
  let documents = Map.empty<Common.DocumentId, SalesTypes.SalesDocument>();
  include SalesMixin(accessControlState, customers, documents, approvedUsers);
};
