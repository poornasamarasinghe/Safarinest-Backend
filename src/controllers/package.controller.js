const packageService = require("../services/package.service");

class PackageController {
  /**
   * Get all packages
   */
  async getPackages(req, res, next) {
    try {
      const packages = await packageService.getAllPackages();
      return res.status(200).json(packages);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get package by ID
   */
  async getPackageById(req, res, next) {
    try {
      const { id } = req.params;
      const pkg = await packageService.getPackageById(id);
      return res.status(200).json(pkg);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update package details (supports optional image file upload)
   */
  async updatePackage(req, res, next) {
    try {
      const { id } = req.params;
      const protocol = req.protocol;
      const host = req.get("host");
      const baseUrl = `${protocol}://${host}`;

      const updatedPackage = await packageService.updatePackage(id, req.file, req.body, baseUrl);
      
      return res.status(200).json({
        success: true,
        message: "Package updated successfully!",
        data: updatedPackage,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PackageController();
