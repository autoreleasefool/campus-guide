package ca.josephroque.uottawacampusguide.database;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * Created by Joseph Roque on 15-05-14.
 * <p/>
 * Provides methods for accessing and managing the internal database
 */
public class DatabaseHelper extends SQLiteOpenHelper
{

    private static final String TAG = "DBHelper";
    private static final String DATABASE_NAME = "campusguide";
    private static final int DATABASE_VERSION = 1;

    private static DatabaseHelper sDatabaseHelperInstance = null;

    public static DatabaseHelper getInstance(Context context)
    {
        if (sDatabaseHelperInstance == null)
            sDatabaseHelperInstance = new DatabaseHelper(context);

        return sDatabaseHelperInstance;
    }

    private DatabaseHelper(Context context)
    {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase database)
    {
        //todo: create database
    }

    @Override
    public void onOpen(SQLiteDatabase database)
    {
        super.onOpen(database);
        if (!database.isReadOnly())
            database.execSQL("PRAGMA foreign_keys=ON;");
    }

    @Override
    public void onUpgrade(SQLiteDatabase database, int oldVersion, int newVersion)
    {
        //todo: update database
    }
}
