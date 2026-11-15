/**
 * Duggu Arts - Google Apps Script Settings Handler
 * 
 * Handles application settings operations
 */

const SettingsHandler = {
  /**
   * Get public settings (for frontend)
   */
  'settings.getPublic': function(payload, requestId) {
    const sheet = getSheet(SHEET_NAMES.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    const settings = { ...APP_SETTINGS.DEFAULT_SETTINGS };
    
    if (data.length > 1) {
      data.slice(1).forEach(row => {
        const key = row[0];
        const value = row[1];
        if (key in settings) {
          // Type conversion
          if (typeof settings[key] === 'number') {
            settings[key] = Number(value) || settings[key];
          } else if (typeof settings[key] === 'boolean') {
            settings[key] = String(value).toLowerCase() === 'true';
          } else {
            settings[key] = value;
          }
        }
      });
    }
    
    // Return only public-safe settings
    return {
      businessName: settings.business_name,
      whatsappNumber: settings.whatsapp_number,
      instagramUrl: settings.instagram_url,
      contactEmail: settings.contact_email,
      announcementText: settings.announcement_text,
      packagingCharge: settings.packaging_charge,
      deliveryCharge: settings.delivery_charge,
      freeDeliveryThreshold: settings.free_delivery_threshold,
    };
  },
  
  /**
   * Get all settings (admin)
   */
  'settings.getAll': function(payload, requestId) {
    const sheet = getSheet(SHEET_NAMES.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    const settings = {};
    
    if (data.length > 1) {
      data.slice(1).forEach(row => {
        settings[row[0]] = {
          value: row[1],
          description: row[2],
        };
      });
    }
    
    // Merge with defaults
    const allSettings = {};
    Object.keys(APP_SETTINGS.DEFAULT_SETTINGS).forEach(key => {
      allSettings[key] = {
        value: settings[key]?.value ?? APP_SETTINGS.DEFAULT_SETTINGS[key],
        description: settings[key]?.description ?? `Default setting for ${key}`,
      };
    });
    
    return allSettings;
  },
  
  /**
   * Update settings (admin)
   */
  'settings.update': function(payload, requestId) {
    const { settings } = payload;
    
    if (!settings || typeof settings !== 'object') {
      throw new Error('settings object is required');
    }
    
    return withSpreadsheetLock(() => {
      const sheet = getSheet(SHEET_NAMES.SETTINGS);
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      const now = getCurrentTimestamp();
      let updated = 0;
      
      Object.entries(settings).forEach(([key, value]) => {
        // Find existing setting
        let rowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i][0] === key) {
            rowIndex = i + 2; // 1-based + header
            break;
          }
        }
        
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        
        if (rowIndex !== -1) {
          // Update existing
          sheet.getRange(rowIndex, 2).setValue(stringValue);
          sheet.getRange(rowIndex, 3).setValue(`Updated via admin on ${now}`);
        } else {
          // Insert new
          sheet.appendRow([key, stringValue, `Created via admin on ${now}`]);
        }
        updated++;
      });
      
      logAudit('system', 'settings_updated', 'settings', 'multiple', { updatedCount: updated });
      
      return { updated, message: `${updated} settings updated successfully` };
    });
  },
};