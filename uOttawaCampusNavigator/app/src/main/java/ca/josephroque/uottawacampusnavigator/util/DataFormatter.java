package ca.josephroque.uottawacampusnavigator.util;

import android.content.res.Resources;
import android.util.Log;

/**
 * Created by Joseph Roque on 15-05-11.
 * <p/>
 * Provides methods to convert various formatted data into different formats.
 */
public class DataFormatter
{

    private static final String TAG = "DataFormatter";
	
	/**
	 * Gets the screen density from the application resources.
	 *
	 * @return resources.getDisplayMetrics().density
	 */
	public static float getScreenDensity(Resources resources)
	{
		return resources.getDisplayMetrics().density;
	}

    /**
     * Converts a dp value to pixels
     * @param scale density of screen
     * @param dps value to be converted
     * @return result of conversion from dps to pixels
     */
    public static int getPixelsFromDP(float scale, int dps)
    {
        return (int)(dps * scale + 0.5f);
    }

    /**
     * Removes all characters in the string which are not digits
     *
     * @param raw string to remove non-digits from
     * @return string with only digits
     */
    public static String stripNonDigits(String raw)
    {
        return raw.replaceAll("\\D", "");
    }

    /**
     * Converts a string containing to a phone number of the format "(555) 0123-456"
     * @param raw igits to format as string
     * @return phone number of the format "(555) 0123-456" or only digits if there are not 10
     */
    public static String formatPhoneNumber(String raw)
    {
        raw = stripNonDigits(raw);
        if (raw.length() != 10)
            return raw;
        return "(" + raw.substring(0, 3) + ") " + raw.substring(3, 6) + "-" + raw.substring(6);
    }
}
