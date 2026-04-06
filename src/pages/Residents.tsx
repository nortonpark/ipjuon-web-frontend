import { useState, useMemo } from "react";
import { Download, QrCode, CreditCard, Upload } from "lucide-react";
import ExcelUploadDialog, { ExcelUploadConfig } from "@/components/ExcelUploadDialog";
import { toast } from "sonner";
import UnitDetailDialog from "@/components/UnitDetailDialog";
import { residentApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { exportToExcel } from "@/lib/exportExcel";
import AdvancedFilterBar, { FilterValues, applyCommonFilters } from "@/components/AdvancedFilterBar";
import TablePagination, { paginate } from "@/components/TablePagination";

const getStatusBadge = (value: string) => {
  if (["발급완료", "납부완료", "완료", "유효"].includes(value)) return "status-complete";
  if (["예약완료"].includes(value)) return "status-pending";
  if (value === "—") return "";
  return "status-error";
};

const Residents = () => {
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({ search: "", dong: "전체", status: "전체" });
  const [page, setPage] = useState(1);

  const uploadConfig: ExcelUploadConfig = {
    title: "입주자 엑셀 업로드",
    tableName: "residents",
    columns: [
      { dbField: "name", label: "입주자명", required: true },
      { dbField: "phone", label: "연락처" },
      { dbField: "email", label: "이메일" },
      { dbField: "dong", label: "동", required: true },
      { dbField: "ho", label: "호수", required: true },
    ],
    invalidateKeys: ["residents"],
    transformRow: async (row) => { return { dong: String(row.dong), ho: String(row.ho), name: row.name, phone: row.phone || "" }; },
  };

  const { data: residents = [], isLoading } = useQuery({
    queryKey: ["residents"],
    queryFn: async () => { try { const data = await residentApi.getList(); return data.map((r: any) => ({ dong: r.buildingCode || "", unit: `${r.buildingCode} ${r.unitNumber}`, name: r.name, phone: r.phone, car: r.carNumber || "—", qr: r.qrIssued ? "발급완료" : "미발급", permit: r.permitApproved ? "발급완료" : "미발급", payment: "—", inspection: r.inspectionStatus || "—", movingDate: "—", _unit: {} })); } catch { return []; } },
  });

  const dongOptions = useMemo(() => [...new Set(residents.map((r: any) => r.dong))].filter(Boolean).sort(), [residents]);

  const toUnitData = (r: any) => ({
    dong: r._unit?.dong || "", ho: r._unit?.ho || "", area: r._unit?.area || "84㎡",
    name: r.name, phone: r.phone,
    status: r.inspection === "완료" ? "입주완료" : "입주예정",
    payment: r.payment, permit: r.permit,
    moving: r.movingDate !== "—" ? "예약완료" : "미예약",
  });

  const filtered = applyCommonFilters(residents, filters, {
    searchFields: ["name", "phone", "unit"],
    statusField: "inspection",
    dongField: "dong",
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">입주자 목록</h1>
        <p className="page-description">QR 관리 · 입주증 발급·승인 · 차량 등록 현황</p>
      </div>

      <AdvancedFilterBar
        config={{
          searchPlaceholder: "이름 / 연락처 / 세대",
          dongOptions,
          statusOptions: [
            { label: "전체", value: "전체" },
            { label: "완료", value: "완료" },
            { label: "미예약", value: "미예약" },
          ],
          statusLabel: "사검상태",
        }}
        values={filters}
        onChange={(v) => { setFilters(v); setPage(1); }}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="ml-auto flex gap-2">
          <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md flex items-center gap-1" onClick={() => toast.success("QR 일괄발급이 완료되었습니다.")}><QrCode className="w-4 h-4" /> QR 일괄발급</button>
          <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md flex items-center gap-1" onClick={() => toast.success("입주증 일괄승인이 완료되었습니다.")}><CreditCard className="w-4 h-4" /> 입주증 일괄승인</button>
          <button className="px-4 py-2 text-sm border border-border rounded-md bg-card flex items-center gap-1" onClick={() => setUploadOpen(true)}><Upload className="w-4 h-4" /> 엑셀 업로드</button>
          <button className="px-4 py-2 text-sm border border-border rounded-md bg-card flex items-center gap-1" onClick={() => {
            exportToExcel(filtered, [
              { key: "unit", label: "세대" }, { key: "name", label: "입주자명" }, { key: "phone", label: "연락처" },
              { key: "car", label: "차량번호" }, { key: "qr", label: "QR상태" }, { key: "permit", label: "입주증" },
              { key: "payment", label: "잔금" }, { key: "inspection", label: "사검예약" }, { key: "movingDate", label: "이사일" },
            ], "입주자목록");
            toast.success("엑셀 파일이 다운로드되었습니다.");
          }}><Download className="w-4 h-4" /> 엑셀 다운로드</button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>세대</th><th>입주자명</th><th>연락처</th><th>차량번호</th>
                <th>QR상태</th><th>입주증</th><th>잔금</th><th>사검예약</th><th>이사일</th>
              </tr>
            </thead>
            <tbody>
              {paginate(filtered, page).map((r: any, i: number) => (
                <tr key={i} className="cursor-pointer hover:bg-accent/50" onClick={() => { setSelectedUnit(toUnitData(r)); setDialogOpen(true); }}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td>{r.unit}</td>
                  <td className="font-medium">{r.name}</td>
                  <td>{r.phone}</td>
                  <td>{r.car}</td>
                  <td><span className={`status-badge ${getStatusBadge(r.qr)}`}>{r.qr}</span></td>
                  <td><span className={`status-badge ${getStatusBadge(r.permit)}`}>{r.permit}</span></td>
                  <td><span className={`status-badge ${getStatusBadge(r.payment)}`}>{r.payment}</span></td>
                  <td><span className={`status-badge ${getStatusBadge(r.inspection)}`}>{r.inspection}</span></td>
                  <td>{r.movingDate}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} className="text-center py-6 text-muted-foreground">검색 결과가 없습니다.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <TablePagination currentPage={page} totalItems={filtered.length} onPageChange={(p) => setPage(p)} />

      <UnitDetailDialog open={dialogOpen} onOpenChange={setDialogOpen} unit={selectedUnit} />
      <ExcelUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} config={uploadConfig} />
    </div>
  );
};

export default Residents;
