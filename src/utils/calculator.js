export const FLIGHT_TYPES = {
  TYPE_1_1: '1.1 Nội địa (B787, A350, A321, A320)',
  TYPE_1_2: '1.2 Nội địa nối tiếp Qtế tầm trung/dài (có HLKG)',
  TYPE_2_1: '2.1 Chuyên cơ nội địa kết hợp chở khách'
};

const subtractMinutesToTimeString = (hhmm, minutesToSubtract) => {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;
  
  let newTotal = totalMinutes - minutesToSubtract;
  if (newTotal < 0) {
    newTotal += 24 * 60; // Roll backwards to previous day
  }
  
  const h = Math.floor(newTotal / 60) % 24;
  const m = newTotal % 60;
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const calculateBriefingTime = (etd, flightType) => {
  if (!etd || !flightType) return null;
  
  const [hours, minutes] = etd.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  
  // Checking group based on ETD bounds
  // Group I: 09h00 (540) to 12h00 (720) and 18h00 (1080) to 22h00 (1320)
  const isGroup1 = (timeInMinutes >= 540 && timeInMinutes <= 720) || 
                   (timeInMinutes >= 1080 && timeInMinutes <= 1320);
                   
  let briefingOffset = 0;
  let pickupOffset = 0;
  
  if (isGroup1) {
    switch (flightType) {
      case FLIGHT_TYPES.TYPE_1_1:
        briefingOffset = 120; // 02h00
        pickupOffset = 100; // 01h40
        break;
      case FLIGHT_TYPES.TYPE_1_2:
        briefingOffset = 130; // 02h10
        pickupOffset = 110; // 01h50
        break;
      case FLIGHT_TYPES.TYPE_2_1:
        briefingOffset = 155; // 02h35
        pickupOffset = 135; // 02h15
        break;
      default:
        break;
    }
  } else {
    // Group II: all remaining times
    switch (flightType) {
      case FLIGHT_TYPES.TYPE_1_1:
        briefingOffset = 105; // 01h45
        pickupOffset = 85; // 01h25
        break;
      case FLIGHT_TYPES.TYPE_1_2:
        briefingOffset = 115; // 01h55
        pickupOffset = 95; // 01h35
        break;
      case FLIGHT_TYPES.TYPE_2_1:
        briefingOffset = 145; // 02h25
        pickupOffset = 125; // 02h05
        break;
      default:
        break;
    }
  }
  
  return {
    group: isGroup1 ? "Khung giờ I" : "Khung giờ II",
    briefingTime: subtractMinutesToTimeString(etd, briefingOffset),
    pickupTime: subtractMinutesToTimeString(etd, pickupOffset),
    terminal: "Nhà ga T3",
    offsetT1: isGroup1 ? "+ 30 phút" : "+ 15 phút"
  };
};
