package ca.josephroque.uottawacampusnavigator.database;

import android.content.Context;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * Created by Joseph Roque on 2015-06-10.
 * <p/>
 * Methods to create and modify database.
 */
public class DatabaseHelper extends SQLiteOpenHelper
{

    /** Identifies output from this class in Logcat. */
    @SuppressWarnings("unused")
    private static final String TAG = "DatabaseHelper";

    private static final String DATABASE_NAME = "uottawacampusnav";

    private static final int DATABASE_VERSION = 1;

    /**
     *
     * @param context
     */
    private DatabaseHelper(Context context)
    {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

}
