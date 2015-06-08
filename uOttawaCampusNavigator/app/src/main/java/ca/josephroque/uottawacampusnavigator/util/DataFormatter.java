package ca.josephroque.uottawacampusnavigator.util;

import android.content.res.Resources;

/**
 * Created by Joseph Roque on 15-05-11.
 * <p/>
 * Provides methods to convert various formatted data into different formats.
 */
public final class DataFormatter
{
    /** Identifies output from this class in Logcat. */
    @SuppressWarnings("unused")
    private static final String TAG = "DataFormatter";

    // Constant values

    /** Ratio for converting dp to pixels using screen density. */
    private static final float DP_PIXEL_DENSITY_RATIO = 0.5f;
    /** Length of phone numbers. */
    private static final byte PHONE_NUMBER_LENGTH = 10;
    /** Position at which area code ends in a valid phone number. */
    private static final byte AREA_CODE_END = 3;
    /** Position at which middle digits end in valid phone number. (i.e. 123-555-1234 the '555') */
    private static final byte SECONDARY_DIGITS_END = 6;

    /** Empty private constructor. */
    private DataFormatter()
    {
        //does nothing
    }

    /**
     * Gets the screen density from the application resources.
     *
     * @param resources to get display metrics
     * @return resources.getDisplayMetrics().density
     */
    public static float getScreenDensity(Resources resources)
    {
        return resources.getDisplayMetrics().density;
    }

    /**
     * Converts a dp value to pixels.
     *
     * @param scale density of screen
     * @param dps value to be converted
     * @return result of conversion from dps to pixels
     */
    public static int getPixelsFromDP(float scale, int dps)
    {
        return (int) (dps * scale + DP_PIXEL_DENSITY_RATIO);
    }

    /**
     * Removes all characters in the string which are not digits.
     *
     * @param raw string to remove non-digits from
     * @return string with only digits
     */
    public static String stripNonDigits(String raw)
    {
        return raw.replaceAll("\\D", "");
    }

    /**
     * Converts a string containing to a phone number of the format "(555) 0123-456".
     *
     * @param raw digits to format as string
     * @return phone number of the format "(555) 0123-456" or only digits if there are not 10
     */
    public static String formatPhoneNumber(String raw)
    {
        raw = stripNonDigits(raw);
        if (raw.length() != PHONE_NUMBER_LENGTH)
            return raw;
        return "(" + raw.substring(0, AREA_CODE_END) + ") "
                + raw.substring(AREA_CODE_END, SECONDARY_DIGITS_END)
                + "-" + raw.substring(SECONDARY_DIGITS_END);
    }
}
