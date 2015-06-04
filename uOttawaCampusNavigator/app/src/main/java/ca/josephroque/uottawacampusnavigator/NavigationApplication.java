package ca.josephroque.uottawacampusnavigator;

import android.app.Application;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.preference.PreferenceManager;

import java.util.Locale;

import ca.josephroque.uottawacampusnavigator.util.Constants;

/**
 * Created by Joseph Roque on 15-06-04.
 * <p/>
 * Application which provides global variables and language configuration.
 */
public class NavigationApplication extends Application
{
    private Locale locale;

    @Override
    public void onConfigurationChanged(Configuration newConfig)
    {
        super.onConfigurationChanged(newConfig);
        if (locale != null)
        {
            newConfig.locale = locale;
            Locale.setDefault(locale);
            getBaseContext().getResources().updateConfiguration(newConfig,
                    getBaseContext().getResources().getDisplayMetrics());
        }
    }

    @Override
    public void onCreate()
    {
        super.onCreate();

        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        Configuration config =
                new Configuration(getBaseContext().getResources().getConfiguration());

        String lang = (sharedPreferences.getBoolean(Constants.PREF_LANGUAGE_SELECTED, true)
                ? "en_CA"
                : "en_FR");
        if (!config.locale.getLanguage().equals(lang))
        {
            locale = new Locale(lang);
            Locale.setDefault(locale);
            config.locale = locale;
            getBaseContext().getResources().updateConfiguration(config,
                    getBaseContext().getResources().getDisplayMetrics());
        }
    }
}
