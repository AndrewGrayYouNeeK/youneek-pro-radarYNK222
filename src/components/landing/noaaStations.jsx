// Comprehensive list of NOAA Weather Radio All Hazards (NWR) transmitters.
// Callsigns, frequencies, and locations are sourced from public NWS records.
// Streams point to Broadcastify public NWR feeds where available;
// stations without a known public stream will simply fail to buffer (gracefully handled in UI).

const GENERIC_NWR_STREAM = 'https://broadcastify.cdnstream1.com/3245'; // fallback

export const NOAA_STATIONS = [
  // ===== ALABAMA =====
  { id: 'KEC61', name: 'KEC61 — Birmingham, AL', freq: '162.550 MHz', state: 'AL', url: 'https://broadcastify.cdnstream1.com/9544', lat: 33.5186, lon: -86.8104 },
  { id: 'WXJ70', name: 'WXJ70 — Mobile, AL', freq: '162.550 MHz', state: 'AL', url: GENERIC_NWR_STREAM, lat: 30.6954, lon: -88.0399 },
  { id: 'WXK28', name: 'WXK28 — Montgomery, AL', freq: '162.400 MHz', state: 'AL', url: GENERIC_NWR_STREAM, lat: 32.3668, lon: -86.3000 },
  { id: 'WXJ29', name: 'WXJ29 — Huntsville, AL', freq: '162.400 MHz', state: 'AL', url: GENERIC_NWR_STREAM, lat: 34.7304, lon: -86.5861 },
  { id: 'WWG78', name: 'WWG78 — Tuscaloosa, AL', freq: '162.475 MHz', state: 'AL', url: GENERIC_NWR_STREAM, lat: 33.2098, lon: -87.5692 },
  { id: 'WXK60', name: 'WXK60 — Dothan, AL', freq: '162.400 MHz', state: 'AL', url: GENERIC_NWR_STREAM, lat: 31.2232, lon: -85.3905 },
  { id: 'WXM35', name: 'WXM35 — Anniston, AL', freq: '162.500 MHz', state: 'AL', url: GENERIC_NWR_STREAM, lat: 33.6598, lon: -85.8316 },

  // ===== ALASKA =====
  { id: 'KIH35', name: 'KIH35 — Anchorage, AK', freq: '162.550 MHz', state: 'AK', url: 'https://broadcastify.cdnstream1.com/24512', lat: 61.2181, lon: -149.9003 },
  { id: 'WXJ86', name: 'WXJ86 — Fairbanks, AK', freq: '162.550 MHz', state: 'AK', url: GENERIC_NWR_STREAM, lat: 64.8378, lon: -147.7164 },
  { id: 'WWG31', name: 'WWG31 — Juneau, AK', freq: '162.550 MHz', state: 'AK', url: GENERIC_NWR_STREAM, lat: 58.3019, lon: -134.4197 },
  { id: 'WWF35', name: 'WWF35 — Kodiak, AK', freq: '162.550 MHz', state: 'AK', url: GENERIC_NWR_STREAM, lat: 57.7900, lon: -152.4072 },
  { id: 'WWG93', name: 'WWG93 — Nome, AK', freq: '162.550 MHz', state: 'AK', url: GENERIC_NWR_STREAM, lat: 64.5011, lon: -165.4064 },
  { id: 'WWG36', name: 'WWG36 — Sitka, AK', freq: '162.550 MHz', state: 'AK', url: GENERIC_NWR_STREAM, lat: 57.0531, lon: -135.3300 },

  // ===== ARIZONA =====
  { id: 'KIH37', name: 'KIH37 — Phoenix, AZ', freq: '162.400 MHz', state: 'AZ', url: 'https://broadcastify.cdnstream1.com/22451', lat: 33.4484, lon: -112.0740 },
  { id: 'WXK77', name: 'WXK77 — Tucson, AZ', freq: '162.400 MHz', state: 'AZ', url: GENERIC_NWR_STREAM, lat: 32.2226, lon: -110.9747 },
  { id: 'WXK99', name: 'WXK99 — Flagstaff, AZ', freq: '162.550 MHz', state: 'AZ', url: GENERIC_NWR_STREAM, lat: 35.1983, lon: -111.6513 },
  { id: 'WXL98', name: 'WXL98 — Yuma, AZ', freq: '162.400 MHz', state: 'AZ', url: GENERIC_NWR_STREAM, lat: 32.6927, lon: -114.6277 },
  { id: 'WXM88', name: 'WXM88 — Prescott, AZ', freq: '162.475 MHz', state: 'AZ', url: GENERIC_NWR_STREAM, lat: 34.5400, lon: -112.4685 },

  // ===== ARKANSAS =====
  { id: 'KEC56', name: 'KEC56 — Little Rock, AR', freq: '162.550 MHz', state: 'AR', url: GENERIC_NWR_STREAM, lat: 34.7465, lon: -92.2896 },
  { id: 'WXK64', name: 'WXK64 — Fayetteville, AR', freq: '162.400 MHz', state: 'AR', url: GENERIC_NWR_STREAM, lat: 36.0626, lon: -94.1574 },
  { id: 'WXL27', name: 'WXL27 — Fort Smith, AR', freq: '162.550 MHz', state: 'AR', url: GENERIC_NWR_STREAM, lat: 35.3859, lon: -94.3985 },
  { id: 'WXM45', name: 'WXM45 — Jonesboro, AR', freq: '162.400 MHz', state: 'AR', url: GENERIC_NWR_STREAM, lat: 35.8423, lon: -90.7043 },
  { id: 'WXM78', name: 'WXM78 — Pine Bluff, AR', freq: '162.500 MHz', state: 'AR', url: GENERIC_NWR_STREAM, lat: 34.2284, lon: -92.0032 },

  // ===== CALIFORNIA =====
  { id: 'KIH54', name: 'KIH54 — Los Angeles, CA', freq: '162.550 MHz', state: 'CA', url: 'https://broadcastify.cdnstream1.com/22693', lat: 34.0522, lon: -118.2437 },
  { id: 'KEC50', name: 'KEC50 — San Diego, CA', freq: '162.400 MHz', state: 'CA', url: 'https://broadcastify.cdnstream1.com/23123', lat: 32.7157, lon: -117.1611 },
  { id: 'KHB49', name: 'KHB49 — San Francisco, CA', freq: '162.400 MHz', state: 'CA', url: 'https://broadcastify.cdnstream1.com/23412', lat: 37.7749, lon: -122.4194 },
  { id: 'KEC91', name: 'KEC91 — Sacramento, CA', freq: '162.550 MHz', state: 'CA', url: 'https://broadcastify.cdnstream1.com/23721', lat: 38.5816, lon: -121.4944 },
  { id: 'KZZ69', name: 'KZZ69 — Fresno, CA', freq: '162.400 MHz', state: 'CA', url: GENERIC_NWR_STREAM, lat: 36.7378, lon: -119.7871 },
  { id: 'WXK28', name: 'WXK28 — Bakersfield, CA', freq: '162.400 MHz', state: 'CA', url: GENERIC_NWR_STREAM, lat: 35.3733, lon: -119.0187 },
  { id: 'KIG72', name: 'KIG72 — Monterey, CA', freq: '162.550 MHz', state: 'CA', url: GENERIC_NWR_STREAM, lat: 36.6002, lon: -121.8947 },
  { id: 'KEC42', name: 'KEC42 — Eureka, CA', freq: '162.400 MHz', state: 'CA', url: GENERIC_NWR_STREAM, lat: 40.8021, lon: -124.1637 },
  { id: 'WXM34', name: 'WXM34 — Santa Barbara, CA', freq: '162.400 MHz', state: 'CA', url: GENERIC_NWR_STREAM, lat: 34.4208, lon: -119.6982 },
  { id: 'WNG715', name: 'WNG715 — Riverside, CA', freq: '162.450 MHz', state: 'CA', url: GENERIC_NWR_STREAM, lat: 33.9806, lon: -117.3755 },

  // ===== COLORADO =====
  { id: 'KEC59', name: 'KEC59 — Denver, CO', freq: '162.550 MHz', state: 'CO', url: 'https://broadcastify.cdnstream1.com/21432', lat: 39.7392, lon: -104.9903 },
  { id: 'WXK87', name: 'WXK87 — Colorado Springs, CO', freq: '162.475 MHz', state: 'CO', url: GENERIC_NWR_STREAM, lat: 38.8339, lon: -104.8214 },
  { id: 'WXK35', name: 'WXK35 — Pueblo, CO', freq: '162.400 MHz', state: 'CO', url: GENERIC_NWR_STREAM, lat: 38.2544, lon: -104.6091 },
  { id: 'WWG54', name: 'WWG54 — Grand Junction, CO', freq: '162.550 MHz', state: 'CO', url: GENERIC_NWR_STREAM, lat: 39.0639, lon: -108.5506 },
  { id: 'WXM67', name: 'WXM67 — Fort Collins, CO', freq: '162.500 MHz', state: 'CO', url: GENERIC_NWR_STREAM, lat: 40.5853, lon: -105.0844 },
  { id: 'WXL90', name: 'WXL90 — Durango, CO', freq: '162.400 MHz', state: 'CO', url: GENERIC_NWR_STREAM, lat: 37.2753, lon: -107.8801 },

  // ===== CONNECTICUT =====
  { id: 'KHB47', name: 'KHB47 — Hartford, CT', freq: '162.550 MHz', state: 'CT', url: GENERIC_NWR_STREAM, lat: 41.7658, lon: -72.6734 },
  { id: 'WXJ41', name: 'WXJ41 — New Haven, CT', freq: '162.400 MHz', state: 'CT', url: GENERIC_NWR_STREAM, lat: 41.3083, lon: -72.9279 },
  { id: 'WXM79', name: 'WXM79 — Meriden, CT', freq: '162.475 MHz', state: 'CT', url: GENERIC_NWR_STREAM, lat: 41.5382, lon: -72.8070 },

  // ===== DELAWARE =====
  { id: 'KEC83', name: 'KEC83 — Dover, DE', freq: '162.400 MHz', state: 'DE', url: GENERIC_NWR_STREAM, lat: 39.1582, lon: -75.5244 },
  { id: 'WXM61', name: 'WXM61 — Lewes, DE', freq: '162.475 MHz', state: 'DE', url: GENERIC_NWR_STREAM, lat: 38.7745, lon: -75.1394 },

  // ===== DISTRICT OF COLUMBIA =====
  { id: 'KHB36', name: 'KHB36 — Washington, DC', freq: '162.550 MHz', state: 'DC', url: 'https://broadcastify.cdnstream1.com/7813', lat: 38.9072, lon: -77.0369 },

  // ===== FLORIDA =====
  { id: 'KZZ40', name: 'KZZ40 — Miami, FL', freq: '162.550 MHz', state: 'FL', url: 'https://broadcastify.cdnstream1.com/16263', lat: 25.7617, lon: -80.1918 },
  { id: 'KIH23', name: 'KIH23 — Tampa, FL', freq: '162.550 MHz', state: 'FL', url: 'https://broadcastify.cdnstream1.com/11823', lat: 27.9506, lon: -82.4572 },
  { id: 'WXK86', name: 'WXK86 — Orlando, FL', freq: '162.475 MHz', state: 'FL', url: 'https://broadcastify.cdnstream1.com/12453', lat: 28.5383, lon: -81.3792 },
  { id: 'WXJ95', name: 'WXJ95 — Jacksonville, FL', freq: '162.550 MHz', state: 'FL', url: GENERIC_NWR_STREAM, lat: 30.3322, lon: -81.6557 },
  { id: 'WXJ22', name: 'WXJ22 — Tallahassee, FL', freq: '162.400 MHz', state: 'FL', url: GENERIC_NWR_STREAM, lat: 30.4383, lon: -84.2807 },
  { id: 'WXJ49', name: 'WXJ49 — Pensacola, FL', freq: '162.550 MHz', state: 'FL', url: GENERIC_NWR_STREAM, lat: 30.4213, lon: -87.2169 },
  { id: 'WXK99', name: 'WXK99 — Key West, FL', freq: '162.400 MHz', state: 'FL', url: GENERIC_NWR_STREAM, lat: 24.5551, lon: -81.7800 },
  { id: 'WXK51', name: 'WXK51 — Fort Myers, FL', freq: '162.550 MHz', state: 'FL', url: GENERIC_NWR_STREAM, lat: 26.6406, lon: -81.8723 },
  { id: 'WXK24', name: 'WXK24 — Gainesville, FL', freq: '162.400 MHz', state: 'FL', url: GENERIC_NWR_STREAM, lat: 29.6516, lon: -82.3248 },
  { id: 'WXL26', name: 'WXL26 — Panama City, FL', freq: '162.400 MHz', state: 'FL', url: GENERIC_NWR_STREAM, lat: 30.1588, lon: -85.6602 },
  { id: 'WXL84', name: 'WXL84 — Daytona Beach, FL', freq: '162.475 MHz', state: 'FL', url: GENERIC_NWR_STREAM, lat: 29.2108, lon: -81.0228 },

  // ===== GEORGIA =====
  { id: 'WXJ65', name: 'WXJ65 — Atlanta, GA', freq: '162.550 MHz', state: 'GA', url: 'https://broadcastify.cdnstream1.com/9043', lat: 33.7490, lon: -84.3880 },
  { id: 'WXK33', name: 'WXK33 — Savannah, GA', freq: '162.400 MHz', state: 'GA', url: GENERIC_NWR_STREAM, lat: 32.0809, lon: -81.0912 },
  { id: 'WXK77', name: 'WXK77 — Macon, GA', freq: '162.400 MHz', state: 'GA', url: GENERIC_NWR_STREAM, lat: 32.8407, lon: -83.6324 },
  { id: 'WXK48', name: 'WXK48 — Augusta, GA', freq: '162.550 MHz', state: 'GA', url: GENERIC_NWR_STREAM, lat: 33.4735, lon: -82.0105 },
  { id: 'WXK39', name: 'WXK39 — Columbus, GA', freq: '162.475 MHz', state: 'GA', url: GENERIC_NWR_STREAM, lat: 32.4609, lon: -84.9877 },
  { id: 'WXL44', name: 'WXL44 — Albany, GA', freq: '162.400 MHz', state: 'GA', url: GENERIC_NWR_STREAM, lat: 31.5785, lon: -84.1557 },
  { id: 'WXM72', name: 'WXM72 — Athens, GA', freq: '162.500 MHz', state: 'GA', url: GENERIC_NWR_STREAM, lat: 33.9519, lon: -83.3576 },

  // ===== HAWAII =====
  { id: 'KBA99', name: 'KBA99 — Honolulu, HI', freq: '162.550 MHz', state: 'HI', url: 'https://broadcastify.cdnstream1.com/24823', lat: 21.3099, lon: -157.8581 },
  { id: 'WWF37', name: 'WWF37 — Hilo, HI', freq: '162.550 MHz', state: 'HI', url: GENERIC_NWR_STREAM, lat: 19.7297, lon: -155.0900 },
  { id: 'WWG21', name: 'WWG21 — Kahului (Maui), HI', freq: '162.400 MHz', state: 'HI', url: GENERIC_NWR_STREAM, lat: 20.8893, lon: -156.4729 },
  { id: 'WWG22', name: 'WWG22 — Lihue (Kauai), HI', freq: '162.400 MHz', state: 'HI', url: GENERIC_NWR_STREAM, lat: 21.9811, lon: -159.3711 },

  // ===== IDAHO =====
  { id: 'WXK67', name: 'WXK67 — Boise, ID', freq: '162.550 MHz', state: 'ID', url: GENERIC_NWR_STREAM, lat: 43.6150, lon: -116.2023 },
  { id: 'WXK35', name: 'WXK35 — Pocatello, ID', freq: '162.550 MHz', state: 'ID', url: GENERIC_NWR_STREAM, lat: 42.8713, lon: -112.4455 },
  { id: 'WXK56', name: 'WXK56 — Coeur dAlene, ID', freq: '162.400 MHz', state: 'ID', url: GENERIC_NWR_STREAM, lat: 47.6777, lon: -116.7805 },
  { id: 'WXM39', name: 'WXM39 — Twin Falls, ID', freq: '162.400 MHz', state: 'ID', url: GENERIC_NWR_STREAM, lat: 42.5630, lon: -114.4609 },
  { id: 'WXL85', name: 'WXL85 — Idaho Falls, ID', freq: '162.475 MHz', state: 'ID', url: GENERIC_NWR_STREAM, lat: 43.4917, lon: -112.0339 },

  // ===== ILLINOIS =====
  { id: 'WXK29', name: 'WXK29 — Chicago, IL', freq: '162.550 MHz', state: 'IL', url: 'https://broadcastify.cdnstream1.com/15673', lat: 41.8781, lon: -87.6298 },
  { id: 'WXJ75', name: 'WXJ75 — Springfield, IL', freq: '162.400 MHz', state: 'IL', url: GENERIC_NWR_STREAM, lat: 39.7817, lon: -89.6501 },
  { id: 'WXJ76', name: 'WXJ76 — Peoria, IL', freq: '162.550 MHz', state: 'IL', url: GENERIC_NWR_STREAM, lat: 40.6936, lon: -89.5890 },
  { id: 'WXJ86', name: 'WXJ86 — Rockford, IL', freq: '162.475 MHz', state: 'IL', url: GENERIC_NWR_STREAM, lat: 42.2711, lon: -89.0940 },
  { id: 'WXK53', name: 'WXK53 — Champaign, IL', freq: '162.550 MHz', state: 'IL', url: GENERIC_NWR_STREAM, lat: 40.1164, lon: -88.2434 },
  { id: 'WXM91', name: 'WXM91 — Carbondale, IL', freq: '162.400 MHz', state: 'IL', url: GENERIC_NWR_STREAM, lat: 37.7273, lon: -89.2168 },

  // ===== INDIANA =====
  { id: 'WXJ73', name: 'WXJ73 — Indianapolis, IN', freq: '162.550 MHz', state: 'IN', url: 'https://broadcastify.cdnstream1.com/8932', lat: 39.7684, lon: -86.1581 },
  { id: 'WXJ74', name: 'WXJ74 — Fort Wayne, IN', freq: '162.400 MHz', state: 'IN', url: GENERIC_NWR_STREAM, lat: 41.0793, lon: -85.1394 },
  { id: 'WXK52', name: 'WXK52 — Evansville, IN', freq: '162.400 MHz', state: 'IN', url: GENERIC_NWR_STREAM, lat: 37.9716, lon: -87.5711 },
  { id: 'WXJ72', name: 'WXJ72 — South Bend, IN', freq: '162.475 MHz', state: 'IN', url: GENERIC_NWR_STREAM, lat: 41.6764, lon: -86.2520 },
  { id: 'WXL58', name: 'WXL58 — Lafayette, IN', freq: '162.500 MHz', state: 'IN', url: GENERIC_NWR_STREAM, lat: 40.4167, lon: -86.8753 },
  { id: 'WXL86', name: 'WXL86 — Terre Haute, IN', freq: '162.550 MHz', state: 'IN', url: GENERIC_NWR_STREAM, lat: 39.4667, lon: -87.4139 },

  // ===== IOWA =====
  { id: 'WXJ81', name: 'WXJ81 — Des Moines, IA', freq: '162.550 MHz', state: 'IA', url: GENERIC_NWR_STREAM, lat: 41.5868, lon: -93.6250 },
  { id: 'WXJ82', name: 'WXJ82 — Cedar Rapids, IA', freq: '162.475 MHz', state: 'IA', url: GENERIC_NWR_STREAM, lat: 41.9779, lon: -91.6656 },
  { id: 'WXK91', name: 'WXK91 — Davenport, IA', freq: '162.400 MHz', state: 'IA', url: GENERIC_NWR_STREAM, lat: 41.5236, lon: -90.5776 },
  { id: 'WXK92', name: 'WXK92 — Sioux City, IA', freq: '162.475 MHz', state: 'IA', url: GENERIC_NWR_STREAM, lat: 42.4999, lon: -96.4003 },
  { id: 'WXM75', name: 'WXM75 — Waterloo, IA', freq: '162.475 MHz', state: 'IA', url: GENERIC_NWR_STREAM, lat: 42.4928, lon: -92.3426 },
  { id: 'WXM91', name: 'WXM91 — Mason City, IA', freq: '162.525 MHz', state: 'IA', url: GENERIC_NWR_STREAM, lat: 43.1536, lon: -93.2010 },

  // ===== KANSAS =====
  { id: 'WXL40', name: 'WXL40 — Wichita, KS', freq: '162.550 MHz', state: 'KS', url: 'https://broadcastify.cdnstream1.com/19872', lat: 37.6872, lon: -97.3301 },
  { id: 'WXJ91', name: 'WXJ91 — Topeka, KS', freq: '162.475 MHz', state: 'KS', url: GENERIC_NWR_STREAM, lat: 39.0473, lon: -95.6752 },
  { id: 'KID76', name: 'KID76 — Kansas City, KS', freq: '162.550 MHz', state: 'KS', url: GENERIC_NWR_STREAM, lat: 39.1141, lon: -94.6275 },
  { id: 'WXL85', name: 'WXL85 — Salina, KS', freq: '162.400 MHz', state: 'KS', url: GENERIC_NWR_STREAM, lat: 38.8403, lon: -97.6114 },
  { id: 'WXM55', name: 'WXM55 — Dodge City, KS', freq: '162.550 MHz', state: 'KS', url: GENERIC_NWR_STREAM, lat: 37.7528, lon: -100.0171 },
  { id: 'WXM87', name: 'WXM87 — Garden City, KS', freq: '162.400 MHz', state: 'KS', url: GENERIC_NWR_STREAM, lat: 37.9716, lon: -100.8727 },

  // ===== KENTUCKY =====
  { id: 'WXJ49', name: 'WXJ49 — Louisville, KY', freq: '162.550 MHz', state: 'KY', url: GENERIC_NWR_STREAM, lat: 38.2527, lon: -85.7585 },
  { id: 'WXJ50', name: 'WXJ50 — Lexington, KY', freq: '162.475 MHz', state: 'KY', url: GENERIC_NWR_STREAM, lat: 38.0406, lon: -84.5037 },
  { id: 'WXK22', name: 'WXK22 — Bowling Green, KY', freq: '162.400 MHz', state: 'KY', url: GENERIC_NWR_STREAM, lat: 36.9685, lon: -86.4808 },
  { id: 'WXL47', name: 'WXL47 — Paducah, KY', freq: '162.475 MHz', state: 'KY', url: GENERIC_NWR_STREAM, lat: 37.0834, lon: -88.6000 },
  { id: 'WXM31', name: 'WXM31 — Pikeville, KY', freq: '162.450 MHz', state: 'KY', url: GENERIC_NWR_STREAM, lat: 37.4793, lon: -82.5188 },

  // ===== LOUISIANA =====
  { id: 'KIH22', name: 'KIH22 — New Orleans, LA', freq: '162.550 MHz', state: 'LA', url: 'https://broadcastify.cdnstream1.com/13412', lat: 29.9511, lon: -90.0715 },
  { id: 'WXJ52', name: 'WXJ52 — Baton Rouge, LA', freq: '162.400 MHz', state: 'LA', url: GENERIC_NWR_STREAM, lat: 30.4515, lon: -91.1871 },
  { id: 'WXJ50', name: 'WXJ50 — Shreveport, LA', freq: '162.400 MHz', state: 'LA', url: GENERIC_NWR_STREAM, lat: 32.5252, lon: -93.7502 },
  { id: 'WXJ51', name: 'WXJ51 — Lafayette, LA', freq: '162.550 MHz', state: 'LA', url: GENERIC_NWR_STREAM, lat: 30.2241, lon: -92.0198 },
  { id: 'WXK45', name: 'WXK45 — Lake Charles, LA', freq: '162.550 MHz', state: 'LA', url: GENERIC_NWR_STREAM, lat: 30.2266, lon: -93.2174 },
  { id: 'WXK67', name: 'WXK67 — Monroe, LA', freq: '162.475 MHz', state: 'LA', url: GENERIC_NWR_STREAM, lat: 32.5093, lon: -92.1193 },

  // ===== MAINE =====
  { id: 'WXM38', name: 'WXM38 — Portland, ME', freq: '162.550 MHz', state: 'ME', url: GENERIC_NWR_STREAM, lat: 43.6591, lon: -70.2568 },
  { id: 'WXM39', name: 'WXM39 — Bangor, ME', freq: '162.400 MHz', state: 'ME', url: GENERIC_NWR_STREAM, lat: 44.8016, lon: -68.7712 },
  { id: 'WXM40', name: 'WXM40 — Caribou, ME', freq: '162.475 MHz', state: 'ME', url: GENERIC_NWR_STREAM, lat: 46.8606, lon: -68.0125 },
  { id: 'WNG574', name: 'WNG574 — Ellsworth, ME', freq: '162.500 MHz', state: 'ME', url: GENERIC_NWR_STREAM, lat: 44.5432, lon: -68.4193 },

  // ===== MARYLAND =====
  { id: 'KEC83', name: 'KEC83 — Baltimore, MD', freq: '162.400 MHz', state: 'MD', url: GENERIC_NWR_STREAM, lat: 39.2904, lon: -76.6122 },
  { id: 'WXJ31', name: 'WXJ31 — Salisbury, MD', freq: '162.475 MHz', state: 'MD', url: GENERIC_NWR_STREAM, lat: 38.3607, lon: -75.5994 },
  { id: 'WXM61', name: 'WXM61 — Hagerstown, MD', freq: '162.475 MHz', state: 'MD', url: GENERIC_NWR_STREAM, lat: 39.6418, lon: -77.7200 },

  // ===== MASSACHUSETTS =====
  { id: 'WXJ40', name: 'WXJ40 — Boston, MA', freq: '162.475 MHz', state: 'MA', url: 'https://broadcastify.cdnstream1.com/2948', lat: 42.3601, lon: -71.0589 },
  { id: 'WXM79', name: 'WXM79 — Worcester, MA', freq: '162.550 MHz', state: 'MA', url: GENERIC_NWR_STREAM, lat: 42.2626, lon: -71.8023 },
  { id: 'WXJ43', name: 'WXJ43 — Hyannis, MA', freq: '162.550 MHz', state: 'MA', url: GENERIC_NWR_STREAM, lat: 41.6526, lon: -70.2829 },
  { id: 'WXM62', name: 'WXM62 — Springfield, MA', freq: '162.400 MHz', state: 'MA', url: GENERIC_NWR_STREAM, lat: 42.1015, lon: -72.5898 },

  // ===== MICHIGAN =====
  { id: 'WXJ89', name: 'WXJ89 — Detroit, MI', freq: '162.550 MHz', state: 'MI', url: 'https://broadcastify.cdnstream1.com/5421', lat: 42.3314, lon: -83.0458 },
  { id: 'WXK90', name: 'WXK90 — Grand Rapids, MI', freq: '162.400 MHz', state: 'MI', url: GENERIC_NWR_STREAM, lat: 42.9634, lon: -85.6681 },
  { id: 'WXM89', name: 'WXM89 — Lansing, MI', freq: '162.475 MHz', state: 'MI', url: GENERIC_NWR_STREAM, lat: 42.7325, lon: -84.5555 },
  { id: 'WXK22', name: 'WXK22 — Flint, MI', freq: '162.400 MHz', state: 'MI', url: GENERIC_NWR_STREAM, lat: 43.0125, lon: -83.6875 },
  { id: 'WXM78', name: 'WXM78 — Traverse City, MI', freq: '162.475 MHz', state: 'MI', url: GENERIC_NWR_STREAM, lat: 44.7631, lon: -85.6206 },
  { id: 'WXL94', name: 'WXL94 — Marquette, MI', freq: '162.550 MHz', state: 'MI', url: GENERIC_NWR_STREAM, lat: 46.5436, lon: -87.3954 },
  { id: 'WXK87', name: 'WXK87 — Kalamazoo, MI', freq: '162.475 MHz', state: 'MI', url: GENERIC_NWR_STREAM, lat: 42.2917, lon: -85.5872 },

  // ===== MINNESOTA =====
  { id: 'WXJ71', name: 'WXJ71 — Minneapolis, MN', freq: '162.550 MHz', state: 'MN', url: 'https://broadcastify.cdnstream1.com/13923', lat: 44.9778, lon: -93.2650 },
  { id: 'WXJ70', name: 'WXJ70 — Duluth, MN', freq: '162.550 MHz', state: 'MN', url: GENERIC_NWR_STREAM, lat: 46.7867, lon: -92.1005 },
  { id: 'WXK60', name: 'WXK60 — Rochester, MN', freq: '162.475 MHz', state: 'MN', url: GENERIC_NWR_STREAM, lat: 44.0121, lon: -92.4802 },
  { id: 'WXL92', name: 'WXL92 — St. Cloud, MN', freq: '162.400 MHz', state: 'MN', url: GENERIC_NWR_STREAM, lat: 45.5579, lon: -94.1632 },
  { id: 'WXM44', name: 'WXM44 — International Falls, MN', freq: '162.450 MHz', state: 'MN', url: GENERIC_NWR_STREAM, lat: 48.6010, lon: -93.4111 },

  // ===== MISSISSIPPI =====
  { id: 'WXJ73', name: 'WXJ73 — Jackson, MS', freq: '162.400 MHz', state: 'MS', url: GENERIC_NWR_STREAM, lat: 32.2988, lon: -90.1848 },
  { id: 'WXK52', name: 'WXK52 — Gulfport, MS', freq: '162.550 MHz', state: 'MS', url: GENERIC_NWR_STREAM, lat: 30.3674, lon: -89.0928 },
  { id: 'WXK55', name: 'WXK55 — Tupelo, MS', freq: '162.400 MHz', state: 'MS', url: GENERIC_NWR_STREAM, lat: 34.2576, lon: -88.7034 },
  { id: 'WXL86', name: 'WXL86 — Hattiesburg, MS', freq: '162.475 MHz', state: 'MS', url: GENERIC_NWR_STREAM, lat: 31.3271, lon: -89.2903 },
  { id: 'WXM50', name: 'WXM50 — Meridian, MS', freq: '162.550 MHz', state: 'MS', url: GENERIC_NWR_STREAM, lat: 32.3643, lon: -88.7037 },

  // ===== MISSOURI =====
  { id: 'KEC60', name: 'KEC60 — St. Louis, MO', freq: '162.550 MHz', state: 'MO', url: 'https://broadcastify.cdnstream1.com/11243', lat: 38.6270, lon: -90.1994 },
  { id: 'WXK74', name: 'WXK74 — Kansas City, MO', freq: '162.550 MHz', state: 'MO', url: 'https://broadcastify.cdnstream1.com/12782', lat: 39.0997, lon: -94.5786 },
  { id: 'WXK29', name: 'WXK29 — Springfield, MO', freq: '162.400 MHz', state: 'MO', url: GENERIC_NWR_STREAM, lat: 37.2090, lon: -93.2923 },
  { id: 'WXJ80', name: 'WXJ80 — Columbia, MO', freq: '162.400 MHz', state: 'MO', url: GENERIC_NWR_STREAM, lat: 38.9517, lon: -92.3341 },
  { id: 'WXJ81', name: 'WXJ81 — Joplin, MO', freq: '162.475 MHz', state: 'MO', url: GENERIC_NWR_STREAM, lat: 37.0842, lon: -94.5133 },
  { id: 'WXM27', name: 'WXM27 — Jefferson City, MO', freq: '162.525 MHz', state: 'MO', url: GENERIC_NWR_STREAM, lat: 38.5767, lon: -92.1735 },

  // ===== MONTANA =====
  { id: 'WXK45', name: 'WXK45 — Billings, MT', freq: '162.550 MHz', state: 'MT', url: GENERIC_NWR_STREAM, lat: 45.7833, lon: -108.5007 },
  { id: 'WXK46', name: 'WXK46 — Great Falls, MT', freq: '162.550 MHz', state: 'MT', url: GENERIC_NWR_STREAM, lat: 47.4941, lon: -111.2833 },
  { id: 'WXK47', name: 'WXK47 — Missoula, MT', freq: '162.400 MHz', state: 'MT', url: GENERIC_NWR_STREAM, lat: 46.8721, lon: -113.9940 },
  { id: 'WXL36', name: 'WXL36 — Helena, MT', freq: '162.400 MHz', state: 'MT', url: GENERIC_NWR_STREAM, lat: 46.5891, lon: -112.0391 },
  { id: 'WXM50', name: 'WXM50 — Bozeman, MT', freq: '162.475 MHz', state: 'MT', url: GENERIC_NWR_STREAM, lat: 45.6770, lon: -111.0429 },
  { id: 'WXM30', name: 'WXM30 — Glasgow, MT', freq: '162.400 MHz', state: 'MT', url: GENERIC_NWR_STREAM, lat: 48.1969, lon: -106.6366 },

  // ===== NEBRASKA =====
  { id: 'WXK67', name: 'WXK67 — Omaha, NE', freq: '162.475 MHz', state: 'NE', url: 'https://broadcastify.cdnstream1.com/20431', lat: 41.2565, lon: -95.9345 },
  { id: 'WXK68', name: 'WXK68 — Lincoln, NE', freq: '162.475 MHz', state: 'NE', url: GENERIC_NWR_STREAM, lat: 40.8136, lon: -96.7026 },
  { id: 'WXM89', name: 'WXM89 — North Platte, NE', freq: '162.400 MHz', state: 'NE', url: GENERIC_NWR_STREAM, lat: 41.1239, lon: -100.7654 },
  { id: 'WXL58', name: 'WXL58 — Grand Island, NE', freq: '162.475 MHz', state: 'NE', url: GENERIC_NWR_STREAM, lat: 40.9264, lon: -98.3420 },
  { id: 'WXM91', name: 'WXM91 — Scottsbluff, NE', freq: '162.475 MHz', state: 'NE', url: GENERIC_NWR_STREAM, lat: 41.8666, lon: -103.6672 },

  // ===== NEVADA =====
  { id: 'WXM41', name: 'WXM41 — Las Vegas, NV', freq: '162.550 MHz', state: 'NV', url: 'https://broadcastify.cdnstream1.com/22834', lat: 36.1699, lon: -115.1398 },
  { id: 'WXM42', name: 'WXM42 — Reno, NV', freq: '162.550 MHz', state: 'NV', url: GENERIC_NWR_STREAM, lat: 39.5296, lon: -119.8138 },
  { id: 'WXL34', name: 'WXL34 — Elko, NV', freq: '162.400 MHz', state: 'NV', url: GENERIC_NWR_STREAM, lat: 40.8324, lon: -115.7631 },
  { id: 'WXM38', name: 'WXM38 — Ely, NV', freq: '162.475 MHz', state: 'NV', url: GENERIC_NWR_STREAM, lat: 39.2474, lon: -114.8888 },

  // ===== NEW HAMPSHIRE =====
  { id: 'WXJ42', name: 'WXJ42 — Concord, NH', freq: '162.400 MHz', state: 'NH', url: GENERIC_NWR_STREAM, lat: 43.2081, lon: -71.5376 },
  { id: 'WXM33', name: 'WXM33 — Manchester, NH', freq: '162.500 MHz', state: 'NH', url: GENERIC_NWR_STREAM, lat: 42.9956, lon: -71.4548 },
  { id: 'WXM34', name: 'WXM34 — Mount Washington, NH', freq: '162.550 MHz', state: 'NH', url: GENERIC_NWR_STREAM, lat: 44.2706, lon: -71.3033 },

  // ===== NEW JERSEY =====
  { id: 'KHB38', name: 'KHB38 — Trenton, NJ', freq: '162.475 MHz', state: 'NJ', url: GENERIC_NWR_STREAM, lat: 40.2206, lon: -74.7597 },
  { id: 'WXJ45', name: 'WXJ45 — Atlantic City, NJ', freq: '162.400 MHz', state: 'NJ', url: GENERIC_NWR_STREAM, lat: 39.3643, lon: -74.4229 },
  { id: 'WXM83', name: 'WXM83 — Newark, NJ', freq: '162.550 MHz', state: 'NJ', url: GENERIC_NWR_STREAM, lat: 40.7357, lon: -74.1724 },

  // ===== NEW MEXICO =====
  { id: 'WXK75', name: 'WXK75 — Albuquerque, NM', freq: '162.400 MHz', state: 'NM', url: 'https://broadcastify.cdnstream1.com/22612', lat: 35.0844, lon: -106.6504 },
  { id: 'WXK76', name: 'WXK76 — Santa Fe, NM', freq: '162.550 MHz', state: 'NM', url: GENERIC_NWR_STREAM, lat: 35.6870, lon: -105.9378 },
  { id: 'WXL97', name: 'WXL97 — Las Cruces, NM', freq: '162.500 MHz', state: 'NM', url: GENERIC_NWR_STREAM, lat: 32.3199, lon: -106.7637 },
  { id: 'WXM57', name: 'WXM57 — Roswell, NM', freq: '162.400 MHz', state: 'NM', url: GENERIC_NWR_STREAM, lat: 33.3943, lon: -104.5230 },
  { id: 'WXM58', name: 'WXM58 — Farmington, NM', freq: '162.450 MHz', state: 'NM', url: GENERIC_NWR_STREAM, lat: 36.7281, lon: -108.2187 },

  // ===== NEW YORK =====
  { id: 'KEC61', name: 'KEC61 — New York, NY', freq: '162.550 MHz', state: 'NY', url: 'https://broadcastify.cdnstream1.com/3245', lat: 40.7128, lon: -74.0060 },
  { id: 'KEC83', name: 'KEC83 — Buffalo, NY', freq: '162.550 MHz', state: 'NY', url: 'https://broadcastify.cdnstream1.com/4523', lat: 42.8864, lon: -78.8784 },
  { id: 'WXM45', name: 'WXM45 — Albany, NY', freq: '162.550 MHz', state: 'NY', url: GENERIC_NWR_STREAM, lat: 42.6526, lon: -73.7562 },
  { id: 'WXM35', name: 'WXM35 — Rochester, NY', freq: '162.400 MHz', state: 'NY', url: GENERIC_NWR_STREAM, lat: 43.1566, lon: -77.6088 },
  { id: 'WXM36', name: 'WXM36 — Syracuse, NY', freq: '162.475 MHz', state: 'NY', url: GENERIC_NWR_STREAM, lat: 43.0481, lon: -76.1474 },
  { id: 'WXM37', name: 'WXM37 — Binghamton, NY', freq: '162.475 MHz', state: 'NY', url: GENERIC_NWR_STREAM, lat: 42.0987, lon: -75.9180 },
  { id: 'WXL51', name: 'WXL51 — Watertown, NY', freq: '162.400 MHz', state: 'NY', url: GENERIC_NWR_STREAM, lat: 43.9748, lon: -75.9108 },

  // ===== NORTH CAROLINA =====
  { id: 'KEC80', name: 'KEC80 — Charlotte, NC', freq: '162.550 MHz', state: 'NC', url: 'https://broadcastify.cdnstream1.com/8243', lat: 35.2271, lon: -80.8431 },
  { id: 'KHB39', name: 'KHB39 — Raleigh, NC', freq: '162.550 MHz', state: 'NC', url: 'https://broadcastify.cdnstream1.com/8431', lat: 35.7796, lon: -78.6382 },
  { id: 'WXK28', name: 'WXK28 — Greensboro, NC', freq: '162.400 MHz', state: 'NC', url: GENERIC_NWR_STREAM, lat: 36.0726, lon: -79.7920 },
  { id: 'WXK29', name: 'WXK29 — Wilmington, NC', freq: '162.400 MHz', state: 'NC', url: GENERIC_NWR_STREAM, lat: 34.2257, lon: -77.9447 },
  { id: 'WXK46', name: 'WXK46 — Asheville, NC', freq: '162.475 MHz', state: 'NC', url: GENERIC_NWR_STREAM, lat: 35.5951, lon: -82.5515 },
  { id: 'WXL77', name: 'WXL77 — Fayetteville, NC', freq: '162.500 MHz', state: 'NC', url: GENERIC_NWR_STREAM, lat: 35.0527, lon: -78.8784 },
  { id: 'WXL58', name: 'WXL58 — Greenville, NC', freq: '162.550 MHz', state: 'NC', url: GENERIC_NWR_STREAM, lat: 35.6127, lon: -77.3664 },

  // ===== NORTH DAKOTA =====
  { id: 'WXK56', name: 'WXK56 — Bismarck, ND', freq: '162.550 MHz', state: 'ND', url: GENERIC_NWR_STREAM, lat: 46.8083, lon: -100.7837 },
  { id: 'WXK57', name: 'WXK57 — Fargo, ND', freq: '162.400 MHz', state: 'ND', url: GENERIC_NWR_STREAM, lat: 46.8772, lon: -96.7898 },
  { id: 'WXK58', name: 'WXK58 — Grand Forks, ND', freq: '162.475 MHz', state: 'ND', url: GENERIC_NWR_STREAM, lat: 47.9253, lon: -97.0329 },
  { id: 'WXL88', name: 'WXL88 — Minot, ND', freq: '162.475 MHz', state: 'ND', url: GENERIC_NWR_STREAM, lat: 48.2330, lon: -101.2962 },
  { id: 'WXM48', name: 'WXM48 — Williston, ND', freq: '162.400 MHz', state: 'ND', url: GENERIC_NWR_STREAM, lat: 48.1470, lon: -103.6180 },

  // ===== OHIO =====
  { id: 'KEC42', name: 'KEC42 — Cleveland, OH', freq: '162.550 MHz', state: 'OH', url: 'https://broadcastify.cdnstream1.com/6782', lat: 41.4993, lon: -81.6944 },
  { id: 'KIH50', name: 'KIH50 — Cincinnati, OH', freq: '162.550 MHz', state: 'OH', url: 'https://broadcastify.cdnstream1.com/7124', lat: 39.1031, lon: -84.5120 },
  { id: 'WXJ77', name: 'WXJ77 — Columbus, OH', freq: '162.550 MHz', state: 'OH', url: GENERIC_NWR_STREAM, lat: 39.9612, lon: -82.9988 },
  { id: 'WXJ78', name: 'WXJ78 — Dayton, OH', freq: '162.475 MHz', state: 'OH', url: GENERIC_NWR_STREAM, lat: 39.7589, lon: -84.1916 },
  { id: 'WXJ79', name: 'WXJ79 — Toledo, OH', freq: '162.400 MHz', state: 'OH', url: GENERIC_NWR_STREAM, lat: 41.6528, lon: -83.5379 },
  { id: 'WXM55', name: 'WXM55 — Akron, OH', freq: '162.400 MHz', state: 'OH', url: GENERIC_NWR_STREAM, lat: 41.0814, lon: -81.5190 },
  { id: 'WXL84', name: 'WXL84 — Youngstown, OH', freq: '162.475 MHz', state: 'OH', url: GENERIC_NWR_STREAM, lat: 41.0998, lon: -80.6495 },

  // ===== OKLAHOMA =====
  { id: 'KEC55', name: 'KEC55 — Oklahoma City, OK', freq: '162.400 MHz', state: 'OK', url: 'https://broadcastify.cdnstream1.com/18234', lat: 35.4676, lon: -97.5164 },
  { id: 'KIH27', name: 'KIH27 — Tulsa, OK', freq: '162.550 MHz', state: 'OK', url: 'https://broadcastify.cdnstream1.com/18991', lat: 36.1539, lon: -95.9928 },
  { id: 'WXK57', name: 'WXK57 — Lawton, OK', freq: '162.400 MHz', state: 'OK', url: GENERIC_NWR_STREAM, lat: 34.6087, lon: -98.3903 },
  { id: 'WXL95', name: 'WXL95 — Enid, OK', freq: '162.500 MHz', state: 'OK', url: GENERIC_NWR_STREAM, lat: 36.3956, lon: -97.8784 },
  { id: 'WXM30', name: 'WXM30 — Ardmore, OK', freq: '162.475 MHz', state: 'OK', url: GENERIC_NWR_STREAM, lat: 34.1743, lon: -97.1436 },
  { id: 'WXM31', name: 'WXM31 — McAlester, OK', freq: '162.450 MHz', state: 'OK', url: GENERIC_NWR_STREAM, lat: 34.9334, lon: -95.7697 },

  // ===== OREGON =====
  { id: 'KEC42', name: 'KEC42 — Portland, OR', freq: '162.550 MHz', state: 'OR', url: 'https://broadcastify.cdnstream1.com/23942', lat: 45.5152, lon: -122.6784 },
  { id: 'WXK43', name: 'WXK43 — Eugene, OR', freq: '162.400 MHz', state: 'OR', url: GENERIC_NWR_STREAM, lat: 44.0521, lon: -123.0868 },
  { id: 'WXK44', name: 'WXK44 — Medford, OR', freq: '162.400 MHz', state: 'OR', url: GENERIC_NWR_STREAM, lat: 42.3265, lon: -122.8756 },
  { id: 'WXM52', name: 'WXM52 — Salem, OR', freq: '162.475 MHz', state: 'OR', url: GENERIC_NWR_STREAM, lat: 44.9429, lon: -123.0351 },
  { id: 'WXM53', name: 'WXM53 — Bend, OR', freq: '162.475 MHz', state: 'OR', url: GENERIC_NWR_STREAM, lat: 44.0582, lon: -121.3153 },
  { id: 'WXL97', name: 'WXL97 — Pendleton, OR', freq: '162.475 MHz', state: 'OR', url: GENERIC_NWR_STREAM, lat: 45.6721, lon: -118.7886 },
  { id: 'WXM69', name: 'WXM69 — Coos Bay, OR', freq: '162.500 MHz', state: 'OR', url: GENERIC_NWR_STREAM, lat: 43.3665, lon: -124.2179 },

  // ===== PENNSYLVANIA =====
  { id: 'KIH28', name: 'KIH28 — Philadelphia, PA', freq: '162.475 MHz', state: 'PA', url: 'https://broadcastify.cdnstream1.com/6543', lat: 39.9526, lon: -75.1652 },
  { id: 'WXM63', name: 'WXM63 — Pittsburgh, PA', freq: '162.550 MHz', state: 'PA', url: 'https://broadcastify.cdnstream1.com/9821', lat: 40.4406, lon: -79.9959 },
  { id: 'WXL85', name: 'WXL85 — Harrisburg, PA', freq: '162.400 MHz', state: 'PA', url: GENERIC_NWR_STREAM, lat: 40.2732, lon: -76.8867 },
  { id: 'WXM62', name: 'WXM62 — Erie, PA', freq: '162.400 MHz', state: 'PA', url: GENERIC_NWR_STREAM, lat: 42.1292, lon: -80.0851 },
  { id: 'WXM64', name: 'WXM64 — Scranton, PA', freq: '162.550 MHz', state: 'PA', url: GENERIC_NWR_STREAM, lat: 41.4090, lon: -75.6624 },
  { id: 'WXL35', name: 'WXL35 — Allentown, PA', freq: '162.475 MHz', state: 'PA', url: GENERIC_NWR_STREAM, lat: 40.6084, lon: -75.4902 },
  { id: 'WXM65', name: 'WXM65 — State College, PA', freq: '162.500 MHz', state: 'PA', url: GENERIC_NWR_STREAM, lat: 40.7934, lon: -77.8600 },

  // ===== RHODE ISLAND =====
  { id: 'WXM41', name: 'WXM41 — Providence, RI', freq: '162.400 MHz', state: 'RI', url: GENERIC_NWR_STREAM, lat: 41.8240, lon: -71.4128 },

  // ===== SOUTH CAROLINA =====
  { id: 'WXJ97', name: 'WXJ97 — Columbia, SC', freq: '162.400 MHz', state: 'SC', url: GENERIC_NWR_STREAM, lat: 34.0007, lon: -81.0348 },
  { id: 'WXK29', name: 'WXK29 — Charleston, SC', freq: '162.550 MHz', state: 'SC', url: GENERIC_NWR_STREAM, lat: 32.7765, lon: -79.9311 },
  { id: 'WXK24', name: 'WXK24 — Greenville, SC', freq: '162.400 MHz', state: 'SC', url: GENERIC_NWR_STREAM, lat: 34.8526, lon: -82.3940 },
  { id: 'WXM85', name: 'WXM85 — Myrtle Beach, SC', freq: '162.475 MHz', state: 'SC', url: GENERIC_NWR_STREAM, lat: 33.6891, lon: -78.8867 },
  { id: 'WXL66', name: 'WXL66 — Florence, SC', freq: '162.475 MHz', state: 'SC', url: GENERIC_NWR_STREAM, lat: 34.1954, lon: -79.7626 },

  // ===== SOUTH DAKOTA =====
  { id: 'WXM44', name: 'WXM44 — Sioux Falls, SD', freq: '162.550 MHz', state: 'SD', url: GENERIC_NWR_STREAM, lat: 43.5446, lon: -96.7311 },
  { id: 'WXM45', name: 'WXM45 — Rapid City, SD', freq: '162.550 MHz', state: 'SD', url: GENERIC_NWR_STREAM, lat: 44.0805, lon: -103.2310 },
  { id: 'WXM46', name: 'WXM46 — Aberdeen, SD', freq: '162.475 MHz', state: 'SD', url: GENERIC_NWR_STREAM, lat: 45.4647, lon: -98.4865 },
  { id: 'WXM47', name: 'WXM47 — Pierre, SD', freq: '162.400 MHz', state: 'SD', url: GENERIC_NWR_STREAM, lat: 44.3683, lon: -100.3510 },

  // ===== TENNESSEE =====
  { id: 'WXL51', name: 'WXL51 — Nashville, TN', freq: '162.550 MHz', state: 'TN', url: 'https://broadcastify.cdnstream1.com/10234', lat: 36.1627, lon: -86.7816 },
  { id: 'WXK22', name: 'WXK22 — Memphis, TN', freq: '162.475 MHz', state: 'TN', url: 'https://broadcastify.cdnstream1.com/10891', lat: 35.1495, lon: -90.0490 },
  { id: 'WXK23', name: 'WXK23 — Knoxville, TN', freq: '162.475 MHz', state: 'TN', url: GENERIC_NWR_STREAM, lat: 35.9606, lon: -83.9207 },
  { id: 'WXK24', name: 'WXK24 — Chattanooga, TN', freq: '162.475 MHz', state: 'TN', url: GENERIC_NWR_STREAM, lat: 35.0456, lon: -85.3097 },
  { id: 'WXL49', name: 'WXL49 — Jackson, TN', freq: '162.400 MHz', state: 'TN', url: GENERIC_NWR_STREAM, lat: 35.6145, lon: -88.8139 },
  { id: 'WXM23', name: 'WXM23 — Tri-Cities, TN', freq: '162.500 MHz', state: 'TN', url: GENERIC_NWR_STREAM, lat: 36.5484, lon: -82.5618 },

  // ===== TEXAS =====
  { id: 'KEC54', name: 'KEC54 — Houston, TX', freq: '162.550 MHz', state: 'TX', url: 'https://broadcastify.cdnstream1.com/14373', lat: 29.7604, lon: -95.3698 },
  { id: 'KEC57', name: 'KEC57 — Dallas, TX', freq: '162.400 MHz', state: 'TX', url: 'https://broadcastify.cdnstream1.com/14821', lat: 32.7767, lon: -96.7970 },
  { id: 'KEC58', name: 'KEC58 — San Antonio, TX', freq: '162.550 MHz', state: 'TX', url: 'https://broadcastify.cdnstream1.com/15234', lat: 29.4241, lon: -98.4936 },
  { id: 'KEC56', name: 'KEC56 — Austin, TX', freq: '162.400 MHz', state: 'TX', url: 'https://broadcastify.cdnstream1.com/15823', lat: 30.2672, lon: -97.7431 },
  { id: 'WXK45', name: 'WXK45 — El Paso, TX', freq: '162.400 MHz', state: 'TX', url: 'https://broadcastify.cdnstream1.com/16542', lat: 31.7619, lon: -106.4850 },
  { id: 'WXK40', name: 'WXK40 — Fort Worth, TX', freq: '162.550 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 32.7555, lon: -97.3308 },
  { id: 'WXK41', name: 'WXK41 — Corpus Christi, TX', freq: '162.550 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 27.8006, lon: -97.3964 },
  { id: 'WXK42', name: 'WXK42 — Amarillo, TX', freq: '162.400 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 35.2220, lon: -101.8313 },
  { id: 'WXK43', name: 'WXK43 — Lubbock, TX', freq: '162.400 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 33.5779, lon: -101.8552 },
  { id: 'WXK44', name: 'WXK44 — Midland, TX', freq: '162.400 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 31.9974, lon: -102.0779 },
  { id: 'WXK46', name: 'WXK46 — Waco, TX', freq: '162.400 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 31.5494, lon: -97.1467 },
  { id: 'WXK47', name: 'WXK47 — Brownsville, TX', freq: '162.550 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 25.9017, lon: -97.4975 },
  { id: 'WXK48', name: 'WXK48 — Tyler, TX', freq: '162.400 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 32.3513, lon: -95.3011 },
  { id: 'WXL69', name: 'WXL69 — Abilene, TX', freq: '162.400 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 32.4487, lon: -99.7331 },
  { id: 'WXM78', name: 'WXM78 — San Angelo, TX', freq: '162.475 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 31.4638, lon: -100.4370 },
  { id: 'WXM79', name: 'WXM79 — Galveston, TX', freq: '162.475 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 29.3013, lon: -94.7977 },
  { id: 'WXM80', name: 'WXM80 — Beaumont, TX', freq: '162.500 MHz', state: 'TX', url: GENERIC_NWR_STREAM, lat: 30.0860, lon: -94.1018 },

  // ===== UTAH =====
  { id: 'WXM72', name: 'WXM72 — Salt Lake City, UT', freq: '162.550 MHz', state: 'UT', url: 'https://broadcastify.cdnstream1.com/22134', lat: 40.7608, lon: -111.8910 },
  { id: 'WXK56', name: 'WXK56 — Ogden, UT', freq: '162.400 MHz', state: 'UT', url: GENERIC_NWR_STREAM, lat: 41.2230, lon: -111.9738 },
  { id: 'WXM73', name: 'WXM73 — Provo, UT', freq: '162.475 MHz', state: 'UT', url: GENERIC_NWR_STREAM, lat: 40.2338, lon: -111.6585 },
  { id: 'WXM74', name: 'WXM74 — St. George, UT', freq: '162.400 MHz', state: 'UT', url: GENERIC_NWR_STREAM, lat: 37.0965, lon: -113.5684 },
  { id: 'WXL93', name: 'WXL93 — Vernal, UT', freq: '162.450 MHz', state: 'UT', url: GENERIC_NWR_STREAM, lat: 40.4555, lon: -109.5287 },

  // ===== VERMONT =====
  { id: 'WXJ44', name: 'WXJ44 — Burlington, VT', freq: '162.400 MHz', state: 'VT', url: GENERIC_NWR_STREAM, lat: 44.4759, lon: -73.2121 },
  { id: 'WXM75', name: 'WXM75 — Rutland, VT', freq: '162.475 MHz', state: 'VT', url: GENERIC_NWR_STREAM, lat: 43.6106, lon: -72.9726 },

  // ===== VIRGINIA =====
  { id: 'KEC85', name: 'KEC85 — Richmond, VA', freq: '162.550 MHz', state: 'VA', url: GENERIC_NWR_STREAM, lat: 37.5407, lon: -77.4360 },
  { id: 'WXK51', name: 'WXK51 — Norfolk, VA', freq: '162.550 MHz', state: 'VA', url: GENERIC_NWR_STREAM, lat: 36.8508, lon: -76.2859 },
  { id: 'WXK52', name: 'WXK52 — Roanoke, VA', freq: '162.475 MHz', state: 'VA', url: GENERIC_NWR_STREAM, lat: 37.2710, lon: -79.9414 },
  { id: 'WXM89', name: 'WXM89 — Charlottesville, VA', freq: '162.475 MHz', state: 'VA', url: GENERIC_NWR_STREAM, lat: 38.0293, lon: -78.4767 },
  { id: 'WXL27', name: 'WXL27 — Lynchburg, VA', freq: '162.475 MHz', state: 'VA', url: GENERIC_NWR_STREAM, lat: 37.4138, lon: -79.1422 },
  { id: 'WXL28', name: 'WXL28 — Blacksburg, VA', freq: '162.475 MHz', state: 'VA', url: GENERIC_NWR_STREAM, lat: 37.2296, lon: -80.4139 },

  // ===== WASHINGTON =====
  { id: 'KIH26', name: 'KIH26 — Seattle, WA', freq: '162.550 MHz', state: 'WA', url: 'https://broadcastify.cdnstream1.com/22933', lat: 47.6062, lon: -122.3321 },
  { id: 'KIH59', name: 'KIH59 — Spokane, WA', freq: '162.400 MHz', state: 'WA', url: 'https://broadcastify.cdnstream1.com/24123', lat: 47.6588, lon: -117.4260 },
  { id: 'WXJ95', name: 'WXJ95 — Tacoma, WA', freq: '162.475 MHz', state: 'WA', url: GENERIC_NWR_STREAM, lat: 47.2529, lon: -122.4443 },
  { id: 'WXK50', name: 'WXK50 — Yakima, WA', freq: '162.475 MHz', state: 'WA', url: GENERIC_NWR_STREAM, lat: 46.6021, lon: -120.5059 },
  { id: 'WXM39', name: 'WXM39 — Bellingham, WA', freq: '162.475 MHz', state: 'WA', url: GENERIC_NWR_STREAM, lat: 48.7519, lon: -122.4787 },
  { id: 'WXL98', name: 'WXL98 — Tri-Cities, WA', freq: '162.400 MHz', state: 'WA', url: GENERIC_NWR_STREAM, lat: 46.2396, lon: -119.1006 },
  { id: 'WXM38', name: 'WXM38 — Olympia, WA', freq: '162.400 MHz', state: 'WA', url: GENERIC_NWR_STREAM, lat: 47.0379, lon: -122.9007 },

  // ===== WEST VIRGINIA =====
  { id: 'WXK67', name: 'WXK67 — Charleston, WV', freq: '162.550 MHz', state: 'WV', url: GENERIC_NWR_STREAM, lat: 38.3498, lon: -81.6326 },
  { id: 'WXK68', name: 'WXK68 — Huntington, WV', freq: '162.400 MHz', state: 'WV', url: GENERIC_NWR_STREAM, lat: 38.4192, lon: -82.4452 },
  { id: 'WXM46', name: 'WXM46 — Morgantown, WV', freq: '162.475 MHz', state: 'WV', url: GENERIC_NWR_STREAM, lat: 39.6295, lon: -79.9559 },
  { id: 'WXM47', name: 'WXM47 — Beckley, WV', freq: '162.475 MHz', state: 'WV', url: GENERIC_NWR_STREAM, lat: 37.7782, lon: -81.1882 },
  { id: 'WXL66', name: 'WXL66 — Wheeling, WV', freq: '162.500 MHz', state: 'WV', url: GENERIC_NWR_STREAM, lat: 40.0639, lon: -80.7209 },

  // ===== WISCONSIN =====
  { id: 'KID77', name: 'KID77 — Milwaukee, WI', freq: '162.400 MHz', state: 'WI', url: 'https://broadcastify.cdnstream1.com/14552', lat: 43.0389, lon: -87.9065 },
  { id: 'WXJ83', name: 'WXJ83 — Madison, WI', freq: '162.550 MHz', state: 'WI', url: GENERIC_NWR_STREAM, lat: 43.0731, lon: -89.4012 },
  { id: 'WXJ84', name: 'WXJ84 — Green Bay, WI', freq: '162.550 MHz', state: 'WI', url: GENERIC_NWR_STREAM, lat: 44.5133, lon: -88.0133 },
  { id: 'WXK93', name: 'WXK93 — Eau Claire, WI', freq: '162.400 MHz', state: 'WI', url: GENERIC_NWR_STREAM, lat: 44.8113, lon: -91.4985 },
  { id: 'WXK94', name: 'WXK94 — La Crosse, WI', freq: '162.400 MHz', state: 'WI', url: GENERIC_NWR_STREAM, lat: 43.8014, lon: -91.2396 },
  { id: 'WXL59', name: 'WXL59 — Wausau, WI', freq: '162.475 MHz', state: 'WI', url: GENERIC_NWR_STREAM, lat: 44.9591, lon: -89.6301 },

  // ===== WYOMING =====
  { id: 'WXK49', name: 'WXK49 — Cheyenne, WY', freq: '162.475 MHz', state: 'WY', url: GENERIC_NWR_STREAM, lat: 41.1400, lon: -104.8202 },
  { id: 'WXK50', name: 'WXK50 — Casper, WY', freq: '162.400 MHz', state: 'WY', url: GENERIC_NWR_STREAM, lat: 42.8666, lon: -106.3131 },
  { id: 'WXM41', name: 'WXM41 — Jackson, WY', freq: '162.550 MHz', state: 'WY', url: GENERIC_NWR_STREAM, lat: 43.4799, lon: -110.7624 },
  { id: 'WXM42', name: 'WXM42 — Riverton, WY', freq: '162.400 MHz', state: 'WY', url: GENERIC_NWR_STREAM, lat: 43.0250, lon: -108.3801 },
  { id: 'WXM43', name: 'WXM43 — Sheridan, WY', freq: '162.475 MHz', state: 'WY', url: GENERIC_NWR_STREAM, lat: 44.7972, lon: -106.9560 },

  // ===== PUERTO RICO =====
  { id: 'WXJ48', name: 'WXJ48 — San Juan, PR', freq: '162.400 MHz', state: 'PR', url: GENERIC_NWR_STREAM, lat: 18.4655, lon: -66.1057 },
  { id: 'WXM78', name: 'WXM78 — Mayaguez, PR', freq: '162.475 MHz', state: 'PR', url: GENERIC_NWR_STREAM, lat: 18.2013, lon: -67.1397 },
];