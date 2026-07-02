const fs = require("fs");
const packageRepository = require("../repositories/package.repository");

class PackageService {
  /**
   * Get all packages, self-seeding with defaults if database is empty
   */
  async getAllPackages() {
    let packages = await packageRepository.getAll();
    
    const seedData = [
      {
        id: "leopard-tracker-elite",
        name: "Leopard Tracker Elite",
        price: 450,
        image: "/images/package-leopard.png",
        description: "Premium leopard tracking safari through Block 1.",
        zone: "Yala Block 1",
        duration: "8 Hours",
        guests: 6,
      },
      {
        id: "gentle-giants-expedition",
        name: "Gentle Giants Expedition",
        price: 680,
        image: "/images/package-elephant.png",
        description: "Experience Sri Lanka's elephant gathering.",
        zone: "Kumana",
        duration: "Full Day",
        guests: 8,
      },
      {
        id: "block-5-wilderness",
        name: "Block 5 Hidden Wilderness",
        price: 75,
        image: "/images/package-bear.png",
        description: "Explore the rugged terrain of Block 5, Yala's hidden wilderness known for its dense scrub forest and bear populations.",
        zone: "Block 5",
        duration: "Full Day",
        guests: 4,
      }
    ];

    let missingSeed = false;
    for (const pkg of seedData) {
      const existing = packages.find(p => p.id === pkg.id);
      if (!existing) {
        const { id, ...data } = pkg;
        await packageRepository.create(data, id);
        missingSeed = true;
      } else if (existing.image && existing.image.startsWith("/packages/")) {
        await packageRepository.update(pkg.id, { image: pkg.image });
        missingSeed = true;
      }
    }

    if (missingSeed) {
      packages = await packageRepository.getAll();
    }
    
    return packages;
  }

  /**
   * Get a single package by ID
   */
  async getPackageById(id) {
    const pkg = await packageRepository.getById(id);
    if (!pkg) {
      const error = new Error("Package not found");
      error.status = 404;
      throw error;
    }
    return pkg;
  }

  /**
   * Update package details and option upload new image
   */
  async updatePackage(id, file, body, baseUrl) {
    const existingPackage = await this.getPackageById(id);

    const updateData = {
      name: body.name || existingPackage.name,
      description: body.description || existingPackage.description,
      price: body.price !== undefined ? Number(body.price) : existingPackage.price,
      zone: body.zone || existingPackage.zone,
      duration: body.duration || existingPackage.duration,
      guests: body.guests !== undefined ? Number(body.guests) : existingPackage.guests,
    };

    if (file) {
      // Build new URL
      const imageUrl = `${baseUrl}/uploads/${file.filename}`;
      updateData.image = imageUrl;
      updateData.filePath = file.path;

      // Clean up previous uploaded image if exists
      if (existingPackage.filePath && fs.existsSync(existingPackage.filePath)) {
        try {
          fs.unlinkSync(existingPackage.filePath);
        } catch (err) {
          console.error(`Failed to clean up old package image: ${existingPackage.filePath}`, err);
        }
      }
    }

    return await packageRepository.update(id, updateData);
  }
}

module.exports = new PackageService();
