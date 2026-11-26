package com.youneek.proradar;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Opens this app's system settings when the web layer asks for app-settings:,
 * which is the iOS settings URL. Android has no handler for that scheme.
 */
@CapacitorPlugin(name = "AppSettings")
public class AppSettingsPlugin extends Plugin {

    @Override
    public Boolean shouldOverrideLoad(Uri url) {
        if (url == null || !"app-settings".equals(url.getScheme())) {
            return null;
        }
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", getContext().getPackageName(), null));
        if (getActivity() != null) {
            getActivity().startActivity(intent);
        } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        return Boolean.TRUE;
    }

    /**
     * True when the build includes Firebase config (google-services.json), so FCM
     * registration will not fail. Without it, the web layer skips push and keeps
     * in-app and local notifications only.
     */
    @PluginMethod
    public void pushAvailable(PluginCall call) {
        int id = getContext().getResources().getIdentifier("google_app_id", "string", getContext().getPackageName());
        JSObject result = new JSObject();
        result.put("available", id != 0);
        call.resolve(result);
    }
}
