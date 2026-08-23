import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  Search,
  Store,
} from "lucide-react";

import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminPageLayout from "../../components/admin/AdminPageLayout";
import AdminStatusBadge from "../../components/admin/AdminStatusBadge";
import SellerDetailsModal from "../../components/admin/SellerDetailsModal";

import { getAdminStores } from "../../api/adminStoreService";


function ManageSellersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sellers, setSellers] =
    useState([]);

  const [searchValue, setSearchValue] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [
    selectedSeller,
    setSelectedSeller,
  ] = useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    const loadStores = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const loadedStores =
          await getAdminStores();

        setSellers(
          Array.isArray(loadedStores)
            ? loadedStores
            : []
        );
      } catch (error) {
        console.error(
          "Brands could not be loaded:",
          error
        );

        setErrorMessage(
          error.message ||
            "Brands could not be loaded."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, []);

  useEffect(() => {
    if (
      isLoading ||
      !location.state
    ) {
      return;
    }

    const selectedStoreId = Number(
      location.state.selectedStoreId
    );

    const selectedSellerId = Number(
      location.state.selectedSellerId
    );

    if (
      !selectedStoreId &&
      !selectedSellerId
    ) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    const matchingStore =
      sellers.find((seller) => {
        if (selectedStoreId) {
          return (
            Number(seller.storeId) ===
            selectedStoreId
          );
        }

        return (
          Number(seller.sellerUserId) ===
          selectedSellerId
        );
      });

    if (matchingStore) {
      setSearchValue("");
      setStatusFilter("ALL");
      setSelectedSeller(
        matchingStore
      );
    } else {
      const missingIdentifier =
        selectedStoreId
          ? `Brand #${selectedStoreId}`
          : `Brand owner account #${selectedSellerId}`;

      setErrorMessage(
        `${missingIdentifier} could not be found among approved or suspended brands.`
      );
    }

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [
    sellers,
    isLoading,
    location.pathname,
    location.state,
    navigate,
  ]);

  const filteredSellers =
    useMemo(() => {
      const normalizedSearch =
        searchValue
          .trim()
          .toLowerCase();

      return sellers.filter(
        (seller) => {
          const storeName =
            String(
              seller.storeName || ""
            ).toLowerCase();

          const storeSlug =
            String(
              seller.storeSlug || ""
            ).toLowerCase();

          const fullName =
            String(
              seller.fullName || ""
            ).toLowerCase();

          const email =
            String(
              seller.email || ""
            ).toLowerCase();

          const supportEmail =
            String(
              seller.supportEmail || ""
            ).toLowerCase();

          const matchesSearch =
            normalizedSearch === "" ||
            storeName.includes(
              normalizedSearch
            ) ||
            storeSlug.includes(
              normalizedSearch
            ) ||
            fullName.includes(
              normalizedSearch
            ) ||
            email.includes(
              normalizedSearch
            ) ||
            supportEmail.includes(
              normalizedSearch
            ) ||
            String(
              seller.storeId
            ).includes(
              normalizedSearch
            ) ||
            String(
              seller.sellerUserId
            ).includes(
              normalizedSearch
            );

          const matchesStatus =
            statusFilter === "ALL" ||
            seller.storeStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      sellers,
      searchValue,
      statusFilter,
    ]);

  const sellerCounts =
    useMemo(() => {
      return {
        total: sellers.length,

        active:
          sellers.filter(
            (seller) =>
              seller.storeStatus ===
                "ACTIVE" &&
              seller.approvalStatus ===
                "APPROVED"
          ).length,

        suspended:
          sellers.filter(
            (seller) =>
              seller.storeStatus ===
                "SUSPENDED"
          ).length,

        inactive:
          sellers.filter(
            (seller) =>
              seller.storeStatus ===
                "INACTIVE"
          ).length,

        closed:
          sellers.filter(
            (seller) =>
              seller.storeStatus ===
                "CLOSED"
          ).length,
      };
    }, [sellers]);

  const resetFilters = () => {
    setSearchValue("");
    setStatusFilter("ALL");
  };

  const formatDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "Not available";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Not available";
    }

    return date.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  const columns = [
    {
      key: "store",
      header: "Brand",

      render: (seller) => (
        <div className="admin-seller-table-profile">
          <div className="admin-seller-table-avatar">
            {seller.initials}
          </div>

          <div>
            <strong>
              {seller.storeName}
            </strong>

            <span>
              {seller.fullName}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "storeId",
      header: "Brand ID",

      render: (seller) =>
        `#${seller.storeId}`,
    },
    {
      key: "sellerUserId",
      header:
        "Brand Owner User ID",

      render: (seller) =>
        `#${seller.sellerUserId}`,
    },
    {
      key: "supportEmail",
      header: "Support Email",

      render: (seller) =>
        seller.supportEmail ||
        "Not provided",
    },
    {
      key: "createdDate",
      header:
        "Brand Created Date",

      render: (seller) =>
        formatDate(
          seller.createdDate
        ),
    },
    {
      key: "approvalStatus",
      header:
        "Approval Status",

      render: (seller) => (
        <AdminStatusBadge
          status={
            seller.approvalStatus
          }
        />
      ),
    },
    {
      key: "accountStatus",
      header:
        "Account Status",

      render: (seller) => (
        <AdminStatusBadge
          status={
            seller.accountStatus
          }
        />
      ),
    },
    {
      key: "storeStatus",
      header: "Brand Status",

      render: (seller) => (
        <AdminStatusBadge
          status={
            seller.storeStatus
          }
        />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className:
        "admin-table-actions-column",

      render: (seller) => (
        <button
          type="button"
          className="admin-table-view-button"
          onClick={() =>
            setSelectedSeller(
              seller
            )
          }
        >
          <Eye size={16} />
          View
        </button>
      ),
    },
  ];

  return (
    <AdminPageLayout>
      <AdminPageHeader
        title="Brand Management"
        description="View Store approval, owner account, and operational status. Store ACTIVE/INACTIVE status is controlled by the Seller."
      />

      <section className="admin-user-summary-grid">
        <article className="admin-user-summary-card">
          <span>
            Total Managed Brands
          </span>

          <strong>
            {sellerCounts.total}
          </strong>
        </article>

        <article className="admin-user-summary-card">
          <span>
            Operational Brands
          </span>

          <strong>
            {sellerCounts.active}
          </strong>
        </article>

        <article className="admin-user-summary-card">
          <span>
            Suspended Brands
          </span>

          <strong>
            {sellerCounts.suspended}
          </strong>
        </article>

        <article className="admin-user-summary-card">
          <span>
            Inactive Brands
          </span>

          <strong>
            {sellerCounts.inactive}
          </strong>
        </article>

        <article className="admin-user-summary-card">
          <span>
            Closed Brands
          </span>

          <strong>
            {sellerCounts.closed}
          </strong>
        </article>
      </section>

      {errorMessage && (
        <div className="admin-page-notice admin-page-notice-error">
          {errorMessage}
        </div>
      )}

      <section className="admin-users-panel">
        <div className="admin-sellers-toolbar">
          <div className="admin-users-search">
            <Search size={18} />

            <input
              type="search"
              value={searchValue}
              onChange={(event) =>
                setSearchValue(
                  event.target.value
                )
              }
              placeholder="Search brand, slug, owner, support email, brand ID or owner user ID..."
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            aria-label="Filter brands by brand status"
          >
            <option value="ALL">
              All brand statuses
            </option>

            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="INACTIVE">
              INACTIVE
            </option>

            <option value="SUSPENDED">
              SUSPENDED
            </option>

            <option value="CLOSED">
              CLOSED
            </option>
          </select>

          <button
            type="button"
            className="admin-reset-filters-button"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>

        <div className="admin-users-results-heading">
          <div>
            <Store size={18} />

            <strong>
              {filteredSellers.length}{" "}
              managed brands found
            </strong>
          </div>
        </div>

        {isLoading ? (
          <div className="admin-page-loading">
            Loading brands...
          </div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filteredSellers}
            rowKey="storeId"
            emptyMessage="No brands match the selected filters."
          />
        )}
      </section>

      <SellerDetailsModal
        isOpen={Boolean(
          selectedSeller
        )}
        seller={selectedSeller}
        onClose={() =>
          setSelectedSeller(null)
        }
      />

    </AdminPageLayout>
  );
}

export default ManageSellersPage;
