package ca.josephroque.uottawacampusguide.utility;

import android.graphics.drawable.Drawable;
import android.os.Build;
import android.view.View;

/**
 * Created by Joseph Roque on 15-05-10.
 * <p/>
 * Provides methods for dealing with Android version compatibility and avoiding deprecated
 * methods whenever possible.
 */
@SuppressWarnings("deprecation")
public class Compatibility
{

    /**
     * Sets the background of a view to a drawable, using the appropriate method for the
     * Android version
     * @param view view to set background of
     * @param background drawable for background
     */
    public static void setViewBackgroundDrawable(View view, Drawable background)
    {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN)
            view.setBackground(background);
        else
            view.setBackgroundDrawable(background);
    }
}
