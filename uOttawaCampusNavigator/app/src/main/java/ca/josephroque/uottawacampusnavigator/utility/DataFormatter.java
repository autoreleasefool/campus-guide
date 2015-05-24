package ca.josephroque.uottawacampusnavigator.utility;

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
}
