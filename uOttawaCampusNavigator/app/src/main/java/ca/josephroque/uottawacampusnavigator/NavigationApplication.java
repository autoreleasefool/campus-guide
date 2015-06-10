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
public class NavigationApplication
        extends Application
{

    /** Identifies output from this class in Logcat. */
    @SuppressWarnings("unused")
    private static final String TAG = "NavigationApp";

    /** Locale of application - fr_CA or en_CA. */
    private Locale mLocale;

    /** Name of application package. */
    private static String sPackageName;

    @Override
    public void onConfigurationChanged(Configuration newConfig)
    {
        super.onConfigurationChanged(newConfig);
        if (mLocale != null)
        {
            Configuration config = new Configuration(newConfig);
            config.locale = mLocale;
            Locale.setDefault(mLocale);
            getBaseContext().getResources()
                    .updateConfiguration(config,
                            getBaseContext().getResources()
                                    .getDisplayMetrics());
        }
    }

    @Override
    public void onCreate()
    {
        super.onCreate();
        sPackageName = getPackageName();

        SharedPreferences sharedPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        Configuration config =
                new Configuration(getBaseContext().getResources()
                        .getConfiguration());

        String lang = (sharedPreferences.getBoolean(Constants.PREF_LANGUAGE_SELECTED, true)
                ? "en_CA"
                : "en_FR");
        if (!config.locale.getLanguage()
                .equals(lang))
        {
            mLocale = new Locale(lang);
            Locale.setDefault(mLocale);
            config.locale = mLocale;
            getBaseContext().getResources()
                    .updateConfiguration(config,
                            getBaseContext().getResources()
                                    .getDisplayMetrics());
        }
    }

    /**
     * Returns package name of the application.
     *
     * @return {@code sPackageName}
     */
    public static String getSimplePackageName()
    {
        return sPackageName;
    }
}
