const waitingListService = require("../services/waitingList.service");

class WaitingListController {
  /**
   * GET /api/waiting-list/:id
   * Get a single waiting list entry (used by frontend confirm-slot page)
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const entry = await waitingListService.getById(id);
      return res.status(200).json(entry);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/waiting-list/:id/confirm
   * User confirms the vacant slot from the email link
   */
  async confirmSlot(req, res, next) {
    try {
      const { id } = req.params;
      const booking = await waitingListService.confirmFromWaitingList(id);
      return res.status(200).json({
        success: true,
        message: "Slot confirmed! Your booking has been created.",
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WaitingListController();
