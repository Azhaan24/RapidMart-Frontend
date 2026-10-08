import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AdminCatalogService,AdminProduct,AdminCategory,AdminSubCategory } from '../../../core/services/admin-catalog.service';

import { AdminInventoryService,Inventory,InventoryTransaction } from '../../../core/services/admin-inventory.service';

import { DashboardService, ManagerDashboard } from '../../../core/services/admin-dashboard';
import { SortType } from '../../../core/models/sortType';
import { environment } from '../../../../environments/environment';



@Component({
  selector: 'app-manager-catalog',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css'
})
export class ManagerCatalog implements OnInit {

  private route = inject(ActivatedRoute);
  private catalogService = inject(AdminCatalogService);
  private inventoryService = inject(AdminInventoryService);
  private dashboardService = inject(DashboardService);

  sortBy = signal<SortType>(SortType.alphabeticalAsc);
  available = signal<boolean | null>(null);
  returnable = signal<boolean | null>(null);


  activeTab = signal<'products' | 'categories' | 'inventory'>('products');

  dashboard = signal<ManagerDashboard | null>(null);

  products = signal<AdminProduct[]>([]);

  filteredProducts = signal<AdminProduct[]>([]);

  isLoadingProducts = signal(false);

  productSearchTerm = signal('');

  productStatusFilter = signal<'all' | 'available' | 'unavailable'>('all');

  processingProductId = signal<number | null>(null);

  productPageNumber = signal<number>(1);

  productPageSize = signal<number>(10);

  productTotalCount = signal<number>(0);

  productTotalPages = signal<number>(0);

  productHasNextPage = signal<boolean>(false);

  productHasPreviousPage = signal<boolean>(false);

  showProductForm = signal(false);

  isEditingProduct = signal(false);

  editingProductId = signal<number | null>(null);

  isSavingProduct = signal(false);

  productName = signal('');

  productDescription = signal('');

  productPrice = signal(0);

  productCategoryId = signal(0);

  productSubcategoryId = signal(0);

  initialStock = signal(0);

  reserveStock = signal(0);

  productImage = signal<File | null>(null);

  productImageName = signal('');

  productIsAvailable = signal(true);
  
  productCanReturn = signal(false);

  selectedProduct = signal<AdminProduct | null>(null);

  isLoadingProductDetails = signal(false);

  categories = signal<AdminCategory[]>([]);

  categorySearchTerm = signal('');

  isLoadingCategories = signal(false);

  showCategoryForm = signal(false);

  isEditingCategory = signal(false);

  editingCategoryId = signal<number | null>(null);

  isSavingCategory = signal(false);

  categoryName = signal('');

  categoryImage = signal<File | null>(null);

  categoryImageName = signal('');

  processingCategoryId = signal<number | null>(null);

  subCategories = signal<AdminSubCategory[]>([]);

  showSubCategoryForm = signal(false);

  isEditingSubCategory = signal(false);

  editingSubCategoryId = signal<number | null>(null);

  isSavingSubCategory = signal(false);

  subCategoryName = signal('');

  subCategoryCategoryId = signal(0);

  subCategoryImage = signal<File | null>(null);

  subCategoryImageName = signal('');

  processingSubCategoryId = signal<number | null>(null);

  inventory = signal<Inventory[]>([]);

  isInventoryLoading = signal(false);

  inventoryErrorMessage = signal('');

  editingStockItemId = signal<number | null>(null);

  newStockQuantity = signal<number | null>(null);

  isUpdatingStock = signal(false);

  inventoryActionMessage = signal('');

  inventoryActionError = signal('');

  editingReservedItemId = signal<number | null>(null);

  releaseReservedQuantity = signal<number | null>(null);

  isReleasingReserved = signal(false);

  reservedActionMessage = signal('');

  reservedActionError = signal('');

  inventoryPageNumber = signal<number>(1);

  inventoryPageSize = signal<number>(10);

  inventoryTotalCount = signal<number>(0);

  inventoryTotalPages = signal<number>(0);

  inventoryHasNextPage = signal<boolean>(false);

  inventoryHasPreviousPage = signal<boolean>(false);

  inventoryTransactions = signal<InventoryTransaction[]>([]);

  isTransactionLoading = signal(false);

  transactionErrorMessage = signal('');

  selectedTransactionItem = signal<Inventory | null>(null);

  showTransactionHistory = signal(false);

  transactionPageNumber = signal<number>(1);

  transactionPageSize = signal<number>(10);

  transactionTotalCount = signal<number>(0);

  transactionTotalPages = signal<number>(0);

  transactionHasNextPage = signal<boolean>(false);

  transactionHasPreviousPage = signal<boolean>(false);

  successMessage = signal('');

  errorMessage = signal('');

  totalProducts = signal<number>(0);

  filteredSubCategories = computed(() => {

    const categoryId = this.productCategoryId();

    if (!categoryId) {
      return [];
    }

    return this.subCategories().filter(
      subCategory =>
        subCategory.categoryId === Number(categoryId)
    );
  });


  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const tab = params['tab'];

      if (
        tab === 'products' ||
        tab === 'categories' ||
        tab === 'inventory'
      ) {
        this.activeTab.set(tab);
      }
      else {
        this.activeTab.set('products');
      }

    });

    this.loadDashboard();
    this.loadProducts();
    this.loadCategories();
    this.loadSubCategories();
    this.loadInventory();
  }



  setActiveTab(
    tab: 'products' | 'categories' | 'inventory'
  ): void {

    this.activeTab.set(tab);

    this.clearMessages();

    if (tab === 'products') {
      this.loadProducts();
    }

    if (tab === 'inventory') {
      this.loadInventory();
    }
  }


  private loadDashboard(): void {

    this.dashboardService.getManagerDashboard().subscribe({

      next: data => {
        this.dashboard.set(data);

        this.totalProducts.set(data.totalItems);
      },

      error: error => {
        console.error(
          'Unable to fetch dashboard data:',
          error
        );
      }

    });
  }


  loadProducts(): void {

    this.isLoadingProducts.set(true);

    this.catalogService.getProducts(this.productPageNumber(),this.productPageSize(),this.sortBy(),this.available(),null,this.productSearchTerm()).subscribe({

        next: products => {

          this.products.set(products.items);

          this.productPageNumber.set(products.pageNumber);

          this.productPageSize.set(products.pageSize);

          this.productTotalCount.set(products.totalCount);

          this.productTotalPages.set(products.totalPages);

          this.productHasNextPage.set(products.hasNextPage);

          this.productHasPreviousPage.set(products.hasPreviousPage);

          this.isLoadingProducts.set(false);
        },

        error: error => {

          console.error(
            'Error loading products:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to load products.'
            )
          );

          this.isLoadingProducts.set(false);
        }

      });
  }


  onProductSearchChange(value: string): void {

    this.productPageNumber.set(1);

    this.productSearchTerm.set(value);

    this.loadProducts();
  }


  onProductStatusChange(value: string): void {

    if (
      value !== 'all' &&
      value !== 'available' &&
      value !== 'unavailable'
    ) {
      return;
    }

    this.productPageNumber.set(1);

    this.productStatusFilter.set(value);

    switch(value){
      case 'all':
        this.available.set(null);
        break;
      case 'available':
        this.available.set(true);
        break;
      case 'unavailable':
        this.available.set(false);
        break;
      default:
        this.available.set(null);  
    }

    this.loadProducts();

  }

  goToNextProductPage(): void {

    if (!this.productHasNextPage()) {
      return;
    }

    this.productPageNumber.update(
      page => page + 1
    );

    this.loadProducts();
  }


  goToPreviousProductPage(): void {

    if (!this.productHasPreviousPage()) {
      return;
    }

    this.productPageNumber.update(
      page => page - 1
    );

    this.loadProducts();
  }

  onProductCategoryChange(): void {

    this.productSubcategoryId.set(0);
  }


  openCreateProductForm(): void {

    this.clearMessages();

    this.resetProductForm();

    this.showProductForm.set(true);

    this.isEditingProduct.set(false);

    this.editingProductId.set(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  closeProductForm(): void {

    if (this.isSavingProduct()) {
      return;
    }

    this.showProductForm.set(false);

    this.resetProductForm();
  }


  private resetProductForm(): void {

    this.productName.set('');

    this.productDescription.set('');

    this.productPrice.set(0);

    this.productCategoryId.set(0);

    this.productSubcategoryId.set(0);

    this.initialStock.set(0);

    this.reserveStock.set(0);

    this.productImage.set(null);

    this.productIsAvailable.set(true);

    this.productCanReturn.set(false);

    this.productImageName.set('');
  }


  onProductImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.productImage.set(null);

      this.productImageName.set('');

      return;
    }

    const file = input.files[0];

    this.productImage.set(file);

    this.productImageName.set(file.name);
  }


  createProduct(): void {

    this.clearMessages();

    const name =
      this.productName().trim();

    const description =
      this.productDescription().trim();

    const price =
      this.productPrice();

    const categoryId =
      this.productCategoryId();

    const subcategoryId =
      this.productSubcategoryId();

    const initialStock =
      this.initialStock();

    const reservedStock =
      this.reserveStock();


    if (!name) {

      this.errorMessage.set(
        'Product name is required.'
      );

      return;
    }


    if (price <= 0) {

      this.errorMessage.set(
        'Product price must be greater than 0.'
      );

      return;
    }


    if (!categoryId) {

      this.errorMessage.set(
        'Please select a category.'
      );

      return;
    }


    if (!subcategoryId) {

      this.errorMessage.set(
        'Please select a subcategory.'
      );

      return;
    }


    if (initialStock < 0) {

      this.errorMessage.set(
        'Initial stock cannot be negative.'
      );

      return;
    }


    if (reservedStock < 0) {

      this.errorMessage.set(
        'Reserve stock cannot be negative.'
      );

      return;
    }


    if (reservedStock > initialStock) {

      this.errorMessage.set(
        'Reserve stock cannot be more than initial stock.'
      );

      return;
    }


    const formData = new FormData();

    formData.append(
      'Name',
      name
    );

    formData.append(
      'Description',
      description
    );

    formData.append(
      'Price',
      price.toString()
    );

    formData.append(
      'CategoryId',
      categoryId.toString()
    );

    formData.append(
      'SubcategoryId',
      subcategoryId.toString()
    );

    formData.append(
      'InitialStock',
      initialStock.toString()
    );

    formData.append(
      'ReservedQuantity',
      reservedStock.toString()
    );

    formData.append(
      'IsAvailable',
      this.productIsAvailable().toString()
    );

    formData.append(
      'ReturnEligible',
      this.productCanReturn().toString()
    );


    const image =
      this.productImage();

    if (image) {

      formData.append(
        'Image',
        image
      );
    }


    this.isSavingProduct.set(true);


    this.catalogService
      .createProduct(formData)
      .subscribe({

        next: product => {

          console.log(
            'Product created:',
            product
          );

          this.successMessage.set(
            'Product created successfully.'
          );

          this.showProductForm.set(false);

          this.resetProductForm();

          this.isSavingProduct.set(false);

          this.loadProducts();
        },

        error: error => {

          console.error(
            'Error creating product:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to create product.'
            )
          );

          this.isSavingProduct.set(false);
        }

      });
  }


  viewProduct(
    product: AdminProduct
  ): void {

    this.clearMessages();

    this.selectedProduct.set(null);

    this.isLoadingProductDetails.set(true);


    this.catalogService
      .getProductById(product.id)
      .subscribe({

        next: productDetails => {

          this.selectedProduct.set(
            productDetails
          );

          this.isLoadingProductDetails.set(false);
        },

        error: error => {

          console.error(
            'Error loading product details:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to load product details.'
            )
          );

          this.isLoadingProductDetails.set(false);
        }

      });
  }


  closeProductDetails(): void {

    if (this.isLoadingProductDetails()) {
      return;
    }

    this.selectedProduct.set(null);
  }


  startEditProduct(
    product: AdminProduct
  ): void {

    this.clearMessages();

    this.selectedProduct.set(null);

    this.showProductForm.set(true);

    this.isEditingProduct.set(true);

    this.editingProductId.set(
      product.id
    );


    this.productName.set(
      product.name
    );

    this.productDescription.set(
      product.description
    );

    this.productPrice.set(
      product.price
    );

    this.productCategoryId.set(
      product.categoryId
    );

    this.productSubcategoryId.set(
      product.subcategoryId
    );

    this.productIsAvailable.set(
      product.isAvailable
    );

     this.productCanReturn.set(
      product.returnEligible
    );

    this.initialStock.set(0);

    this.reserveStock.set(0);

    this.productImage.set(null);

    this.productImageName.set('');


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  updateProduct(): void {

    this.clearMessages();

    const editingId =
      this.editingProductId();


    if (editingId === null) {

      this.errorMessage.set(
        'No product selected for editing.'
      );

      return;
    }


    const name =
      this.productName().trim();

    const description =
      this.productDescription().trim();

    const price =
      this.productPrice();

    const categoryId =
      this.productCategoryId();

    const subcategoryId =
      this.productSubcategoryId();


    if (!name) {

      this.errorMessage.set(
        'Product name is required.'
      );

      return;
    }


    if (price <= 0) {

      this.errorMessage.set(
        'Product price must be greater than 0.'
      );

      return;
    }


    if (!categoryId) {

      this.errorMessage.set(
        'Please select a category.'
      );

      return;
    }


    if (!subcategoryId) {

      this.errorMessage.set(
        'Please select a subcategory.'
      );

      return;
    }


    const formData = new FormData();

    formData.append(
      'Name',
      name
    );

    formData.append(
      'Description',
      description
    );

    formData.append(
      'Price',
      price.toString()
    );

    formData.append(
      'CategoryId',
      categoryId.toString()
    );

    formData.append(
      'SubcategoryId',
      subcategoryId.toString()
    );

    formData.append(
      'IsAvailable',
      this.productIsAvailable().toString()
    );

    formData.append(
      'ReturnEligible',
      this.productCanReturn().toString()
    );


    const image =
      this.productImage();

    if (image) {

      formData.append(
        'Image',
        image
      );
    }


    this.isSavingProduct.set(true);


    this.catalogService
      .updateProduct(
        editingId,
        formData
      )
      .subscribe({

        next: updatedProduct => {

          console.log(
            'Product updated:',
            updatedProduct
          );


          this.products.update(
            products =>
              products.map(product =>
                product.id === updatedProduct.id
                  ? updatedProduct
                  : product
              )
          );


          this.loadProducts();


          this.successMessage.set(
            'Product updated successfully.'
          );


          this.showProductForm.set(false);

          this.isEditingProduct.set(false);

          this.editingProductId.set(null);

          this.resetProductForm();

          this.isSavingProduct.set(false);
        },

        error: error => {

          console.error(
            'Error updating product:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to update product.'
            )
          );

          this.isSavingProduct.set(false);
        }

      });
  }


  cancelEditProduct(): void {

    if (this.isSavingProduct()) {
      return;
    }

    this.showProductForm.set(false);

    this.isEditingProduct.set(false);

    this.editingProductId.set(null);

    this.resetProductForm();
  }

  deactivateProduct(
    product: AdminProduct
  ): void {

    this.clearMessages();


    const confirmed =
      confirm(
        `Are you sure you want to deactivate ${product.name}?`
      );


    if (!confirmed) {
      return;
    }


    this.processingProductId.set(
      product.id
    );


    this.catalogService
      .deactivateProduct(product.id)
      .subscribe({

        next: () => {

          this.products.update(
            products =>
              products.map(item =>
                item.id === product.id
                  ? {
                      ...item,
                      isAvailable: false
                    }
                  : item
              )
          );


          this.loadProducts();


          this.successMessage.set(
            'Product deactivated successfully.'
          );

          this.processingProductId.set(null);
        },

        error: error => {

          console.error(
            'Error deactivating product:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to deactivate product.'
            )
          );

          this.processingProductId.set(null);
        }

      });
  }

  loadCategories(): void {

    this.isLoadingCategories.set(true);

    this.catalogService
      .getCategories(this.sortBy(),this.categorySearchTerm())
      .subscribe({

        next: categories => {

          this.categories.set(
            categories
          );

          this.isLoadingCategories.set(false);
        },

        error: error => {

          console.error(
            'Error loading categories:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to load categories.'
            )
          );

          this.isLoadingCategories.set(false);
        }

      });
  }

  onCategoryImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.categoryImage.set(null);

      this.categoryImageName.set('');

      return;
    }

    const file =
      input.files[0];

    this.categoryImage.set(file);

    this.categoryImageName.set(
      file.name
    );
  }

  openCreateCategoryForm(): void {

    this.clearMessages();

    this.resetCategoryForm();

    this.showCategoryForm.set(true);

    this.isEditingCategory.set(false);

    this.editingCategoryId.set(null);
  }


  closeCategoryForm(): void {

    if (this.isSavingCategory()) {
      return;
    }

    this.showCategoryForm.set(false);

    this.resetCategoryForm();
  }


  private resetCategoryForm(): void {

    this.categoryName.set('');

    this.categoryImage.set(null);

    this.categoryImageName.set('');
  }

  createCategory(): void {

    this.clearMessages();

    const name =
      this.categoryName().trim();


    if (!name) {

      this.errorMessage.set(
        'Category name is required.'
      );

      return;
    }


    const formData =
      new FormData();


    formData.append(
      'Name',
      name
    );


    const image =
      this.categoryImage();

    if (image) {

      formData.append(
        'Image',
        image
      );
    }


    this.isSavingCategory.set(true);


    this.catalogService
      .createCategory(formData)
      .subscribe({

        next: category => {

          console.log(
            'Category created:',
            category
          );

          this.successMessage.set(
            'Category created successfully.'
          );

          this.showCategoryForm.set(false);

          this.resetCategoryForm();

          this.isSavingCategory.set(false);

          this.loadCategories();
        },

        error: error => {

          console.error(
            'Error creating category:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to create category.'
            )
          );

          this.isSavingCategory.set(false);
        }

      });
  }


  startEditCategory(
    category: AdminCategory
  ): void {

    this.clearMessages();

    this.showCategoryForm.set(true);

    this.isEditingCategory.set(true);

    this.editingCategoryId.set(
      category.id
    );

    this.categoryName.set(
      category.name
    );

    this.categoryImage.set(null);

    this.categoryImageName.set('');


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  updateCategory(): void {

    this.clearMessages();

    const editingId =
      this.editingCategoryId();


    if (editingId === null) {

      this.errorMessage.set(
        'No category selected for editing.'
      );

      return;
    }


    const name =
      this.categoryName().trim();


    if (!name) {

      this.errorMessage.set(
        'Category name is required.'
      );

      return;
    }


    const formData =
      new FormData();


    formData.append(
      'Name',
      name
    );


    const image =
      this.categoryImage();

    if (image) {

      formData.append(
        'Image',
        image
      );
    }


    this.isSavingCategory.set(true);


    this.catalogService
      .updateCategory(
        editingId,
        formData
      )
      .subscribe({

        next: updatedCategory => {

          this.categories.update(
            categories =>
              categories.map(category =>
                category.id === updatedCategory.id
                  ? updatedCategory
                  : category
              )
          );


          this.successMessage.set(
            'Category updated successfully.'
          );

          this.showCategoryForm.set(false);

          this.isEditingCategory.set(false);

          this.editingCategoryId.set(null);

          this.resetCategoryForm();

          this.isSavingCategory.set(false);
        },

        error: error => {

          console.error(
            'Error updating category:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to update category.'
            )
          );

          this.isSavingCategory.set(false);
        }

      });
  }


  cancelCategoryForm(): void {

    if (this.isSavingCategory()) {
      return;
    }

    this.showCategoryForm.set(false);

    this.isEditingCategory.set(false);

    this.editingCategoryId.set(null);

    this.resetCategoryForm();
  }


  deleteCategory(
    category: AdminCategory
  ): void {

    this.clearMessages();


    const confirmed =
      confirm(
        `Are you sure you want to delete "${category.name}"?`
      );


    if (!confirmed) {
      return;
    }


    this.processingCategoryId.set(
      category.id
    );


    this.catalogService
      .deleteCategory(category.id)
      .subscribe({

        next: () => {

          this.categories.update(
            categories =>
              categories.filter(
                item =>
                  item.id !== category.id
              )
          );


          this.successMessage.set(
            'Category deleted successfully.'
          );

          this.processingCategoryId.set(null);


          this.loadSubCategories();
        },

        error: error => {

          console.error(
            'Error deleting category:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to delete category.'
            )
          );

          this.processingCategoryId.set(null);
        }

      });
  }

  loadSubCategories(): void {

    this.catalogService
      .getSubCategories()
      .subscribe({

        next: subCategories => {

          this.subCategories.set(
            subCategories
          );
        },

        error: error => {

          console.error(
            'Error loading subcategories:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to load subcategories.'
            )
          );
        }

      });
  }


  onSubCategoryImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.subCategoryImage.set(null);

      this.subCategoryImageName.set('');

      return;
    }

    const file =
      input.files[0];

    this.subCategoryImage.set(file);

    this.subCategoryImageName.set(
      file.name
    );
  }

  openCreateSubCategoryForm(): void {

    this.clearMessages();

    this.resetSubCategoryForm();

    this.showSubCategoryForm.set(true);

    this.isEditingSubCategory.set(false);

    this.editingSubCategoryId.set(null);
  }


  closeSubCategoryForm(): void {

    if (this.isSavingSubCategory()) {
      return;
    }

    this.showSubCategoryForm.set(false);

    this.resetSubCategoryForm();
  }


  private resetSubCategoryForm(): void {

    this.subCategoryName.set('');

    this.subCategoryCategoryId.set(0);

    this.subCategoryImage.set(null);

    this.subCategoryImageName.set('');
  }

  createSubCategory(): void {

    this.clearMessages();

    const name =
      this.subCategoryName().trim();

    const categoryId =
      this.subCategoryCategoryId();


    if (!name) {

      this.errorMessage.set(
        'Subcategory name is required.'
      );

      return;
    }


    if (!categoryId) {

      this.errorMessage.set(
        'Please select a category.'
      );

      return;
    }


    const formData =
      new FormData();


    formData.append(
      'Name',
      name
    );

    formData.append(
      'CategoryId',
      categoryId.toString()
    );


    const image =
      this.subCategoryImage();

    if (image) {

      formData.append(
        'Image',
        image
      );
    }


    this.isSavingSubCategory.set(true);


    this.catalogService
      .createSubCategory(formData)
      .subscribe({

        next: subCategory => {

          console.log(
            'Subcategory created:',
            subCategory
          );

          this.successMessage.set(
            'Subcategory created successfully.'
          );

          this.showSubCategoryForm.set(false);

          this.resetSubCategoryForm();

          this.isSavingSubCategory.set(false);

          this.loadSubCategories();
        },

        error: error => {

          console.error(
            'Error creating subcategory:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to create subcategory.'
            )
          );

          this.isSavingSubCategory.set(false);
        }

      });
  }


  startEditSubCategory(
    subCategory: AdminSubCategory
  ): void {

    this.clearMessages();

    this.showSubCategoryForm.set(true);

    this.isEditingSubCategory.set(true);

    this.editingSubCategoryId.set(
      subCategory.id
    );


    this.subCategoryName.set(
      subCategory.name
    );

    this.subCategoryCategoryId.set(
      subCategory.categoryId
    );

    this.subCategoryImage.set(null);

    this.subCategoryImageName.set('');


    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }


  updateSubCategory(): void {

    this.clearMessages();

    const editingId =
      this.editingSubCategoryId();

    const name =
      this.subCategoryName().trim();

    const categoryId =
      this.subCategoryCategoryId();


    if (editingId === null) {

      this.errorMessage.set(
        'No subcategory selected for editing.'
      );

      return;
    }


    if (!name) {

      this.errorMessage.set(
        'Subcategory name is required.'
      );

      return;
    }


    if (!categoryId) {

      this.errorMessage.set(
        'Please select a category.'
      );

      return;
    }


    const formData =
      new FormData();


    formData.append(
      'Name',
      name
    );

    formData.append(
      'CategoryId',
      categoryId.toString()
    );


    const image =
      this.subCategoryImage();

    if (image) {

      formData.append(
        'Image',
        image
      );
    }


    this.isSavingSubCategory.set(true);


    this.catalogService
      .updateSubCategory(
        editingId,
        formData
      )
      .subscribe({

        next: updatedSubCategory => {

          this.subCategories.update(
            subCategories =>
              subCategories.map(subCategory =>
                subCategory.id === updatedSubCategory.id
                  ? updatedSubCategory
                  : subCategory
              )
          );


          this.successMessage.set(
            'Subcategory updated successfully.'
          );

          this.showSubCategoryForm.set(false);

          this.isEditingSubCategory.set(false);

          this.editingSubCategoryId.set(null);

          this.resetSubCategoryForm();

          this.isSavingSubCategory.set(false);
        },

        error: error => {

          console.error(
            'Error updating subcategory:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to update subcategory.'
            )
          );

          this.isSavingSubCategory.set(false);
        }

      });
  }


  cancelSubCategoryForm(): void {

    if (this.isSavingSubCategory()) {
      return;
    }

    this.showSubCategoryForm.set(false);

    this.isEditingSubCategory.set(false);

    this.editingSubCategoryId.set(null);

    this.resetSubCategoryForm();
  }

  deleteSubCategory(
    subCategory: AdminSubCategory
  ): void {

    this.clearMessages();


    const confirmed =
      confirm(
        `Are you sure you want to delete "${subCategory.name}"?`
      );


    if (!confirmed) {
      return;
    }


    this.processingSubCategoryId.set(
      subCategory.id
    );


    this.catalogService
      .deleteSubCategory(
        subCategory.id
      )
      .subscribe({

        next: () => {

          this.subCategories.update(
            subCategories =>
              subCategories.filter(
                item =>
                  item.id !== subCategory.id
              )
          );


          this.successMessage.set(
            'Subcategory deleted successfully.'
          );

          this.processingSubCategoryId.set(null);
        },

        error: error => {

          console.error(
            'Error deleting subcategory:',
            error
          );

          this.errorMessage.set(
            this.getErrorMessage(
              error,
              'Failed to delete subcategory.'
            )
          );

          this.processingSubCategoryId.set(null);
        }

      });
  }


  loadInventory(): void {

    this.isInventoryLoading.set(true);

    this.inventoryErrorMessage.set('');


    this.inventoryService
      .getInventory(
        this.inventoryPageNumber(),
        this.inventoryPageSize()
      )
      .subscribe({

        next: data => {

          this.inventory.set(
            data.items
          );


          this.inventoryPageNumber.set(
            data.pageNumber
          );

          this.inventoryPageSize.set(
            data.pageSize
          );

          this.inventoryTotalCount.set(
            data.totalCount
          );

          this.inventoryTotalPages.set(
            data.totalPages
          );

          this.inventoryHasNextPage.set(
            data.hasNextPage
          );

          this.inventoryHasPreviousPage.set(
            data.hasPreviousPage
          );


          this.isInventoryLoading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load inventory:',
            error
          );

          this.inventoryErrorMessage.set(
            'Failed to load inventory.'
          );

          this.isInventoryLoading.set(false);
        }

      });
  }


  goToNextInventoryPage(): void {

    if (!this.inventoryHasNextPage()) {
      return;
    }

    this.inventoryPageNumber.update(
      page => page + 1
    );

    this.loadInventory();
  }


  goToPreviousInventoryPage(): void {

    if (!this.inventoryHasPreviousPage()) {
      return;
    }

    this.inventoryPageNumber.update(
      page => page - 1
    );

    this.loadInventory();
  }


  getStockStatus(
    item: Inventory
  ): string {

    if (item.availableQuantity <= 0) {
      return 'Out of Stock';
    }

    if (item.availableQuantity <= 10) {
      return 'Low Stock';
    }

    return 'In Stock';
  }


  getStockStatusClass(
    item: Inventory
  ): string {

    if (item.availableQuantity <= 0) {

      return 'bg-red-50 text-red-700 border-red-200';
    }

    if (item.availableQuantity <= 10) {

      return 'bg-amber-50 text-amber-700 border-amber-200';
    }

    return 'bg-green-50 text-green-700 border-green-200';
  }


  startStockEdit(
    item: Inventory
  ): void {

    this.editingStockItemId.set(
      item.itemId
    );

    this.newStockQuantity.set(
      item.quantity
    );

    this.inventoryActionMessage.set('');

    this.inventoryActionError.set('');
  }


  cancelStockEdit(): void {

    this.editingStockItemId.set(null);

    this.newStockQuantity.set(null);

    this.inventoryActionMessage.set('');

    this.inventoryActionError.set('');
  }


  saveStock(
    item: Inventory
  ): void {

    const newQuantity =
      this.newStockQuantity();


    if (
      newQuantity === null ||
      newQuantity < 0
    ) {

      this.inventoryActionError.set(
        'Stock quantity cannot be negative.'
      );

      return;
    }


    this.isUpdatingStock.set(true);

    this.inventoryActionMessage.set('');

    this.inventoryActionError.set('');


    this.inventoryService
      .updateStock(
        item.itemId,
        newQuantity
      )
      .subscribe({

        next: () => {

          this.isUpdatingStock.set(false);

          this.editingStockItemId.set(null);

          this.newStockQuantity.set(null);

          this.inventoryActionMessage.set(
            'Stock updated successfully.'
          );

          this.loadInventory();
        },

        error: error => {

          console.error(
            'Failed to update stock:',
            error
          );

          this.isUpdatingStock.set(false);

          this.inventoryActionError.set(
            error?.error?.message ||
            'Failed to update stock.'
          );
        }

      });
  }

  startReservedRelease(
    item: Inventory
  ): void {

    this.editingReservedItemId.set(
      item.itemId
    );

    this.releaseReservedQuantity.set(null);

    this.reservedActionMessage.set('');

    this.reservedActionError.set('');
  }


  cancelReservedRelease(): void {

    this.editingReservedItemId.set(null);

    this.releaseReservedQuantity.set(null);

    this.reservedActionMessage.set('');

    this.reservedActionError.set('');
  }


  releaseReservedStock(
    item: Inventory
  ): void {

    const releaseQuantity =
      this.releaseReservedQuantity();


    if (
      releaseQuantity === null ||
      releaseQuantity <= 0
    ) {

      this.reservedActionError.set(
        'Release quantity must be greater than zero.'
      );

      return;
    }


    if (
      releaseQuantity >
      item.reservedQuantity
    ) {

      this.reservedActionError.set(
        'You cannot release more than the currently reserved quantity.'
      );

      return;
    }


    this.isReleasingReserved.set(true);

    this.reservedActionMessage.set('');

    this.reservedActionError.set('');


    this.inventoryService
      .releaseReservedStock(
        item.itemId,
        releaseQuantity
      )
      .subscribe({

        next: () => {

          this.isReleasingReserved.set(false);

          this.editingReservedItemId.set(null);

          this.releaseReservedQuantity.set(null);

          this.reservedActionMessage.set(
            'Reserved stock released successfully.'
          );

          this.loadInventory();
        },

        error: error => {

          console.error(
            'Failed to release reserved stock:',
            error
          );

          this.isReleasingReserved.set(false);

          this.reservedActionError.set(
            error?.error?.message ||
            'Failed to release reserved stock.'
          );
        }

      });
  }


  openTransactionHistory(
    item: Inventory
  ): void {

    this.selectedTransactionItem.set(item);

    this.showTransactionHistory.set(true);

    this.inventoryTransactions.set([]);

    this.transactionErrorMessage.set('');

    this.isTransactionLoading.set(true);


    // Start transaction history from page 1
    this.transactionPageNumber.set(1);


    this.loadTransactionHistory();
  }


  private loadTransactionHistory(): void {

    const item =
      this.selectedTransactionItem();

    if (!item) {
      return;
    }


    this.isTransactionLoading.set(true);

    this.transactionErrorMessage.set('');


    this.inventoryService
      .getInventoryTransactions(
        item.itemId,
        this.transactionPageNumber(),
        this.transactionPageSize()
      )
      .subscribe({

        next: data => {

          this.inventoryTransactions.set(
            data.items
          );


          this.transactionPageNumber.set(
            data.pageNumber
          );

          this.transactionPageSize.set(
            data.pageSize
          );

          this.transactionTotalCount.set(
            data.totalCount
          );

          this.transactionTotalPages.set(
            data.totalPages
          );

          this.transactionHasNextPage.set(
            data.hasNextPage
          );

          this.transactionHasPreviousPage.set(
            data.hasPreviousPage
          );


          this.isTransactionLoading.set(false);
        },

        error: error => {

          console.error(
            'Failed to load inventory transactions:',
            error
          );

          this.transactionErrorMessage.set(
            error?.error?.message ||
            'Failed to load transaction history.'
          );

          this.isTransactionLoading.set(false);
        }

      });
  }


  goToNextTransactionPage(): void {

    if (!this.transactionHasNextPage()) {
      return;
    }

    this.transactionPageNumber.update(
      page => page + 1
    );

    this.loadTransactionHistory();
  }


  goToPreviousTransactionPage(): void {

    if (!this.transactionHasPreviousPage()) {
      return;
    }

    this.transactionPageNumber.update(
      page => page - 1
    );

    this.loadTransactionHistory();
  }


  closeTransactionHistory(): void {

    this.showTransactionHistory.set(false);

    this.selectedTransactionItem.set(null);

    this.inventoryTransactions.set([]);

    this.transactionErrorMessage.set('');

    this.transactionPageNumber.set(1);

    this.transactionTotalCount.set(0);

    this.transactionTotalPages.set(0);

    this.transactionHasNextPage.set(false);

    this.transactionHasPreviousPage.set(false);
  }

  getTransactionTypeName(
    type: number
  ): string {

    switch (type) {

      case 1:
        return 'Stock Added';

      case 2:
        return 'Stock Removed';

      case 3:
        return 'Stock Reserved';

      case 4:
        return 'Stock Released';

      case 5:
        return 'Stock Deducted';

      default:
        return 'Inventory Change';
    }
  }


  getImageUrl(
    imageUrl?: string | null
  ): string {

    if (!imageUrl) {
      return '';
    }

    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://')
    ) {
      return imageUrl;
    }

    return `${environment.imageApi}/${imageUrl}`;
  }


  private getErrorMessage(
    error: any,
    fallback: string
  ): string {

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.error?.title) {
      return error.error.title;
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    return fallback;
  }

  clearMessages(): void {

    this.successMessage.set('');

    this.errorMessage.set('');
  }
}