const Inspection = require("../models/inspection.model");
const Batch = require("../models/batch.model");
const { BATCH_STATUS } = require("../constants/batchStatus");


const createInspectionService = async (inspectionData) => {
  try{
  const { inspectionCode, batchId, inspectorId, inspectionDate, result, remarks } = inspectionData;

  // Validate required fields
    if(!inspectionCode || !batchId || !result){
      return {
        success: false,
        message: 'InspectionCode, batchId, and result are required'
      };
    }

     if(!["PASSED", "FAILED"].includes(result)) {
      return {
        success: false,
        message: 'Result must be either PASSED or FAILED'
      };
    }

  // Check batch exists
  const batch = await Batch.findById(batchId);
  if (!batch) {
    return {
        success: false,
        message: 'Batch not found.',
      };
  }

  // Confirm batch is in an inspectable state
  const inspectableStatuses = [
    BATCH_STATUS.DELIVERED,
    BATCH_STATUS.IN_TRANSIT,
    BATCH_STATUS.RECEIVED,
  ];
  if (!inspectableStatuses.includes(batch.status)) {
    return {
        success: false,
        message: `Batch cannot be inspected. Current status: ${batch.status}`,
      };
  }

  // // Prevent re-inspection of already rejected batch
  // if (batch.status === BATCH_STATUS.REJECTED) {
  //   return res.status(400).json({
  //       success: false,
  //       message: 'Batch has already been rejected and cannot be re-inspected.',
  //     });
  // }

  // Prevent duplicate inspection for same batch
const existingBatchInspection = await Inspection.findOne({ batch: batchId });

if(existingBatchInspection){
   return {
      success:false,
      message:"This batch has already been inspected"
   };
}
  const existingInspection = await Inspection.findOne({inspectionCode});
  if (existingInspection) {
    return {
        success: false,
        message: 'Inspection code already exists for this batch',
      };
  }

  // Create inspection record
  const inspection = await Inspection.create({
    inspectionCode,
    batch: batchId,
    inspector: inspectorId,
    inspectionDate: inspectionDate || Date.now(),
    result,
    remarks: remarks || "",
  });

  // Update batch status based on result
  batch.status = result === "PASSED" ? BATCH_STATUS.INSPECTED : BATCH_STATUS.REJECTED;
  await batch.save();

  return {
      success: true,
      message: `Inspection created. Batch marked as ${batch.status}.`,
      data: inspection,
    };

    }catch(error){
    return {
      success: false,
      message: error.message
   };
  }
};


 // Fetch all inspections with optional role-based filtering.
 
const getAllInspectionsService = async (user) => {
  try{
  const { role, _id: userId } = user;
  let query = {};

  if (role === "ADMIN" || role === "DISTRIBUTOR") {
    // Full read access
    query = {};
  } else if (role === "INSPECTOR") {
    // Only their own inspections
    query = { inspector: userId };
  } else if (role === "FARMER") {
    // Only inspections linked to their batches
    const farmerBatches = await Batch.find({ farmer: userId }).select("_id");
    const batchIds = farmerBatches.map((b) => b._id);
    query = { batch: { $in: batchIds } };
  } else {
    return {
        success: false,
        message: `Access denied.`,
      };
  }

  const inspections = await Inspection.find(query)
    .populate("batch", "batchCode status")
    .populate("inspector", "name email")
    .sort({ createdAt: -1 });

  return inspections;
  }catch(error){
    return {
      success: false,
      message: error.message
   };
  }
};


// Fetch a single inspection by ID with role-based access check.

const getInspectionByIdService = async (inspectionId, user) => {
  try{
  const { role, _id: userId } = user;

  const inspection = await Inspection.findById(inspectionId)
    .populate("batch", "batchCode status farmer")
    .populate("inspector", "name email");

  if (!inspection) {
    return {
        success: false,
        message: `Inspection not found.`,
      };
  }

  // Role-based access check
  if (role === "INSPECTOR") {
    if (inspection.inspector._id.toString() !== userId.toString()) {
      return {
        success: false,
        message: `Access denied. This inspection does not belong to you`,
      };
    }
  } else if (role === "FARMER") {
    const batchFarmerId = inspection.batch.farmer?.toString();
    if (batchFarmerId !== userId.toString()) {
      return {
        success: false,
        message: `Access denied. This batch does not belong to you`,
      };
    }
  } else if (role !== "ADMIN" && role !== "DISTRIBUTOR") {
    return {
        success: false,
        message: `Access denied.`,
      };
  }

  return {
      success: true,
      message: 'Inspection fetched successfully.',
      data: inspection,
    };
    }catch(error){
    return {
      success: false,
      message: error.message
   };
  }
};

module.exports = {
  createInspectionService,
  getAllInspectionsService,
  getInspectionByIdService,
};