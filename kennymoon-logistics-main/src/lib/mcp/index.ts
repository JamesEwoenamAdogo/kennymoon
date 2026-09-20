import { auth, defineMcp } from "@lovable.dev/mcp-js";
import trackShipment from "./tools/track-shipment";
import getShippingRates from "./tools/get-shipping-rates";
import listMyShipments from "./tools/list-my-shipments";
import listMyParcels from "./tools/list-my-parcels";
import createParcelPrealert from "./tools/create-parcel-prealert";
import listMyRmbTransactions from "./tools/list-my-rmb-transactions";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "orbit-express-build",
  title: "Orbit Express Build",
  version: "0.1.0",
  instructions:
    "Tools for Kennymoon Int'l Ltd, a China-to-Nigeria freight, RMB payment and warehouse consolidation service. Use `get_shipping_rates` for pricing and the China warehouse address, `track_shipment` for a waybill lookup, and the `list_my_*` / `create_*` tools to read and act on the signed-in customer's parcels, shipments and RMB payments.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getShippingRates,
    trackShipment,
    listMyShipments,
    listMyParcels,
    createParcelPrealert,
    listMyRmbTransactions,
  ] as never,
});
