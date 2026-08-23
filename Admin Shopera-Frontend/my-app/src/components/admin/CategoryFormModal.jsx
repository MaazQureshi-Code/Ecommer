import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FolderPlus,
  X,
} from "lucide-react";

const normalizeId = (value) => {
  const numericValue = Number(value);

  return Number.isInteger(numericValue) &&
    numericValue > 0
    ? numericValue
    : null;
};

const getDescendantCategoryIds = (
  categories,
  categoryId
) => {
  const numericCategoryId =
    normalizeId(categoryId);

  if (!numericCategoryId) {
    return new Set();
  }

  const descendantIds = new Set();
  const pendingParentIds = [
    numericCategoryId,
  ];

  while (pendingParentIds.length > 0) {
    const currentParentId =
      pendingParentIds.shift();

    categories.forEach(
      (currentCategory) => {
        const currentCategoryId =
          normalizeId(
            currentCategory.categoryId
          );

        const currentParentCategoryId =
          normalizeId(
            currentCategory.parentCategoryId
          );

        if (
          currentParentCategoryId ===
            currentParentId &&
          currentCategoryId &&
          !descendantIds.has(
            currentCategoryId
          )
        ) {
          descendantIds.add(
            currentCategoryId
          );

          pendingParentIds.push(
            currentCategoryId
          );
        }
      }
    );
  }

  return descendantIds;
};

function CategoryFormModal({
  isOpen,
  mode = "create",
  category = null,
  categories = [],
  isProcessing = false,
  onSubmit,
  onCancel,
}) {
  const [
    categoryName,
    setCategoryName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    parentCategoryId,
    setParentCategoryId,
  ] = useState("");

  const [
    validationMessage,
    setValidationMessage,
  ] = useState("");

  const isEditMode =
    mode === "edit";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCategoryName(
      category?.categoryName || ""
    );

    setDescription(
      category?.description || ""
    );

    setParentCategoryId(
      category?.parentCategoryId ===
          null ||
        category?.parentCategoryId ===
          undefined
        ? ""
        : String(
            category.parentCategoryId
          )
    );

    setValidationMessage("");
  }, [
    isOpen,
    category,
    mode,
  ]);

  const availableParentCategories =
    useMemo(() => {
      const currentCategoryId =
        normalizeId(
          category?.categoryId
        );

      const descendantCategoryIds =
        getDescendantCategoryIds(
          categories,
          currentCategoryId
        );

      return categories
        .filter(
          (currentCategory) => {
            const currentOptionId =
              normalizeId(
                currentCategory.categoryId
              );

            if (!currentOptionId) {
              return false;
            }

            if (
              currentOptionId ===
              currentCategoryId
            ) {
              return false;
            }

            if (
              descendantCategoryIds.has(
                currentOptionId
              )
            ) {
              return false;
            }

            return true;
          }
        )
        .sort(
          (
            firstCategory,
            secondCategory
          ) =>
            String(
              firstCategory.categoryName ||
                ""
            ).localeCompare(
              String(
                secondCategory.categoryName ||
                  ""
              )
            )
        );
    }, [
      categories,
      category,
    ]);

  if (!isOpen) {
    return null;
  }

  const clearValidation = () => {
    setValidationMessage("");
  };

  const handleCancel = () => {
    if (
      !isProcessing &&
      typeof onCancel === "function"
    ) {
      onCancel();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isProcessing) {
      return;
    }

    if (
      typeof onSubmit !== "function"
    ) {
      setValidationMessage(
        "The category form could not be submitted."
      );

      return;
    }

    const normalizedCategoryName =
      categoryName.trim();

    if (!normalizedCategoryName) {
      setValidationMessage(
        "Category name is required."
      );

      return;
    }

    if (
      normalizedCategoryName.length >
      150
    ) {
      setValidationMessage(
        "Category name cannot exceed 150 characters."
      );

      return;
    }

    let normalizedParentCategoryId =
      null;

    if (parentCategoryId !== "") {
      normalizedParentCategoryId =
        normalizeId(
          parentCategoryId
        );

      if (
        !normalizedParentCategoryId
      ) {
        setValidationMessage(
          "A valid parent category is required."
        );

        return;
      }

      const parentExists =
        availableParentCategories.some(
          (currentCategory) =>
            Number(
              currentCategory.categoryId
            ) ===
            normalizedParentCategoryId
        );

      if (!parentExists) {
        setValidationMessage(
          "The selected parent category is not valid."
        );

        return;
      }
    }

    onSubmit({
      categoryName:
        normalizedCategoryName,

      description:
        description.trim(),

      parentCategoryId:
        normalizedParentCategoryId,
    });
  };

  return (
    <div
      className="admin-modal-overlay"
      onClick={handleCancel}
      role="presentation"
    >
      <form
        className="admin-category-form-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-category-form-title"
      >
        <button
          type="button"
          className="admin-modal-close"
          onClick={handleCancel}
          disabled={isProcessing}
          aria-label="Close category form"
        >
          <X size={19} />
        </button>

        <div className="admin-category-form-icon">
          <FolderPlus size={25} />
        </div>

        <h2 id="admin-category-form-title">
          {isEditMode
            ? "Edit Category"
            : "Create Category"}
        </h2>

        <p className="admin-category-form-description">
          {isEditMode
            ? "Update the category fields and parent relationship."
            : "Create a main category or a subcategory."}
        </p>

        <div className="admin-category-form-fields">
          <label htmlFor="admin-category-name">
            Category name
          </label>

          <input
            id="admin-category-name"
            type="text"
            value={categoryName}
            maxLength={150}
            disabled={isProcessing}
            placeholder="Example: Electronics"
            autoComplete="off"
            onChange={(event) => {
              setCategoryName(
                event.target.value
              );

              clearValidation();
            }}
          />

          <div className="admin-category-character-count">
            {categoryName.length}/150
          </div>

          <label htmlFor="admin-parent-category">
            Parent category
          </label>

          <select
            id="admin-parent-category"
            value={parentCategoryId}
            disabled={isProcessing}
            onChange={(event) => {
              setParentCategoryId(
                event.target.value
              );

              clearValidation();
            }}
          >
            <option value="">
              No parent — main category
            </option>

            {availableParentCategories.map(
              (currentCategory) => (
                <option
                  value={
                    currentCategory.categoryId
                  }
                  key={
                    currentCategory.categoryId
                  }
                >
                  {
                    currentCategory.categoryName
                  }
                </option>
              )
            )}
          </select>

          <p className="admin-category-hierarchy-note">
            The current category and its
            subcategories cannot be selected
            as the parent.
          </p>

          <label htmlFor="admin-category-description">
            Description
          </label>

          <textarea
            id="admin-category-description"
            value={description}
            rows={5}
            disabled={isProcessing}
            placeholder="Describe the products included in this category."
            onChange={(event) => {
              setDescription(
                event.target.value
              );

              clearValidation();
            }}
          />

          <div className="admin-category-manager-field">
            <span>
              Administrator authority
            </span>

            <strong>
              Derived securely from the authenticated session by the backend
            </strong>
          </div>

          <div
            className="admin-category-validation"
            role={
              validationMessage
                ? "alert"
                : undefined
            }
          >
            {validationMessage}
          </div>
        </div>

        <div className="admin-confirm-actions">
          <button
            type="button"
            className="admin-modal-cancel-button"
            onClick={handleCancel}
            disabled={isProcessing}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-modal-confirm-button admin-modal-confirm-success"
            disabled={isProcessing}
          >
            {isProcessing
              ? "Saving..."
              : isEditMode
              ? "Save Changes"
              : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CategoryFormModal;
