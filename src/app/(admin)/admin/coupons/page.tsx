import { setCouponActiveAction } from "@/lib/actions/admin";
import { listCoupons } from "@/lib/db/repository";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const coupons = await listCoupons();
  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">Coupons</h1>
      <p className="text-muted">
        Discount codes customers can apply at checkout. Toggle a code off to stop new redemptions immediately.
      </p>
      {coupons.length === 0 ? (
        <div className="surface-card p-6 text-sm text-muted">No coupons configured.</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Redemptions</th>
                <th className="p-3">Expires</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-border/70">
                  <td className="p-3 font-mono font-medium">{coupon.code}</td>
                  <td className="p-3">
                    {coupon.percentOff
                      ? `${coupon.percentOff}% off`
                      : coupon.amountOffCents
                        ? `${formatCurrency(coupon.amountOffCents, coupon.currency)} off`
                        : "—"}
                  </td>
                  <td className="p-3">
                    {coupon.redemptionCount}
                    {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                  </td>
                  <td className="p-3">{coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        coupon.isActive ? "bg-emerald-100 text-emerald-800" : "bg-navy/5 text-muted"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <form action={setCouponActiveAction.bind(null, coupon.id, !coupon.isActive)}>
                      <button type="submit" className="btn-secondary px-4 py-1.5 text-xs">
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
