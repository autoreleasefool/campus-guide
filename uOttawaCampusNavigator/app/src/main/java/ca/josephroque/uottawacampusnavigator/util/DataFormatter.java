package ca.josephroque.uottawacampusnavigator.util;

/**
 * Created by Joseph Roque on 15-05-11.
 * <p/>
 * Provides methods to convert various formatted data into different formats.
 */
public class DataFormatter
{
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
     * Converts a string containing 10 digits to a phone number of the format "(555) 0123-456"
     * @param raw 10 digits to format as string
     * @return phone number of the format "(555) 0123-456"
     */
    public static String formatPhoneNumber(String raw)
    {
        raw = stripNonDigits(raw);
        if (raw.length() != 10)
            throw new IllegalArgumentException("not a phone number - must be 10 digits");

        return "(" + raw.substring(0, 3) + ") " + raw.substring(3, 6) + "-" + raw.substring(6);
    }
}
