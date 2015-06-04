package ca.josephroque.uottawacampusnavigator;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.support.v4.widget.DrawerLayout;
import android.view.View;

import java.util.Locale;
import java.util.concurrent.atomic.AtomicBoolean;

import ca.josephroque.uottawacampusnavigator.fragment.NavigationDrawerFragment;
import ca.josephroque.uottawacampusnavigator.fragment.navigation.LinksFragment;
import ca.josephroque.uottawacampusnavigator.util.Constants;


public class NavigationActivity extends AppCompatActivity
        implements NavigationDrawerFragment.NavigationDrawerCallbacks
{

    /** Identifies output from this class in Logcat. */
    private static final String TAG = "NavigationActivity";

    /** Fragment managing the behaviors, interactions and presentation of the navigation drawer. */
    private NavigationDrawerFragment mNavigationDrawerFragment;
	
	/** Indicates if the application is current in English (true) or French (false). */
	private boolean mIsAppInEnglish;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(this);
        mIsAppInEnglish = preferences.getBoolean(Constants.PREF_LANGUAGE_SELECTED, true);

        setContentView(R.layout.activity_navigation);
		Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
		setSupportActionBar(toolbar);
		
        mNavigationDrawerFragment = (NavigationDrawerFragment)
                getSupportFragmentManager().findFragmentById(R.id.navigation_drawer_fragment);

        // Set up the drawer.
        mNavigationDrawerFragment.setUp(
                R.id.navigation_drawer,
                (DrawerLayout) findViewById(R.id.drawer_layout));
    }

    @SuppressWarnings("StringEquality")
    @Override
    public void onNavigationDrawerItemSelected(String itemName)
    {
		String[] drawerItems = (mIsAppInEnglish)
				? Constants.NAVIGATION_DRAWER_ITEMS_EN
				: Constants.NAVIGATION_DRAWER_ITEMS_FR;
		
		if (itemName == drawerItems[Constants.NAVIGATION_ITEM_SETTINGS])
        {
			openSettings(null);
			return;
		}

		Fragment fragment = null;
		String fragmentTag;
        String suffix = "";
		if (itemName == drawerItems[Constants.NAVIGATION_ITEM_HOME])
		{
			// TODO: Open Home Fragment
			Log.i(TAG, "TODO: Open HomeFragment");
			fragmentTag = Constants.FRAGMENT_HOME;
		}
		else if (itemName == drawerItems[Constants.NAVIGATION_ITEM_FIND])
		{
			// TODO: Open Find Fragment
			Log.i(TAG, "TODO: Open FindFragment");
			fragmentTag = Constants.FRAGMENT_FIND;
		}
		else if (itemName == drawerItems[Constants.NAVIGATION_ITEM_FAVOURITES])
		{
			// TODO: Open FavouritesFragment
			Log.i(TAG, "TODO: Open FavouritesFragment");
			fragmentTag = Constants.FRAGMENT_FAVOURITES;
		}
		else if (itemName == drawerItems[Constants.NAVIGATION_ITEM_USEFUL_LINKS])
		{
			fragmentTag = Constants.FRAGMENT_LINKS;
			fragment = LinksFragment.newInstance(0, 0, null, "Master");
            suffix = "0";
		}
		else if (itemName == drawerItems[Constants.NAVIGATION_ITEM_BUS_INFO])
		{
			// TODO: Open BusInfoFragment
			Log.i(TAG, "TODO: Open BusInfoFragment");
			fragmentTag = Constants.FRAGMENT_BUS_INFO;
		}
		else if (itemName == drawerItems[Constants.NAVIGATION_ITEM_ACCESSIBILITY])
		{
			// TODO: Open AccessibilityFragment
			Log.i(TAG, "TODO: Open AccessibilityFragmnt");
			fragmentTag = Constants.FRAGMENT_ACCESSIBILITY;
		}
		else if (itemName == drawerItems[Constants.NAVIGATION_ITEM_HOTSPOTS])
		{
			// TODO: Open HotspotsFragment
			Log.i(TAG, "TODO: Open HotspotsFragment");
			fragmentTag = Constants.FRAGMENT_HOTSPOTS;
		}
		else if (itemName == drawerItems[Constants.NAVIGATION_ITEM_HELP])
		{
			// TODO: Open HelpFragment
			Log.i(TAG, "TODO: Open HelpFragment");
			fragmentTag = Constants.FRAGMENT_HELP;
		}
		else if (itemName == drawerItems[Constants.NAVIGATION_ITEM_LANGUAGE])
		{
            final SharedPreferences sharedPreferences =
                    PreferenceManager.getDefaultSharedPreferences(this);
            final boolean startingLanguage =
                    sharedPreferences.getBoolean(Constants.PREF_LANGUAGE_SELECTED, true);
            final AtomicBoolean setLanguage = new AtomicBoolean(startingLanguage);
            final DialogInterface.OnClickListener listener = new DialogInterface.OnClickListener()
            {
                @Override
                public void onClick(DialogInterface dialog, int which)
                {
                    dialog.dismiss();

                    if (which == DialogInterface.BUTTON_POSITIVE
                            && setLanguage.get() != startingLanguage)
                    {
                        Configuration config = new Configuration(
                                getBaseContext().getResources().getConfiguration());
                        sharedPreferences.edit()
                                .putBoolean(Constants.PREF_LANGUAGE_SELECTED, setLanguage.get())
                                .apply();

                        String lang = (setLanguage.get()
                                ? "en_CA"
                                : "en_FR");
                        if (!config.locale.getLanguage().equals(lang))
                        {
                            Locale locale = new Locale(lang);
                            Locale.setDefault(locale);
                            config.locale = locale;
                            getBaseContext().getResources().updateConfiguration(config,
                                    getBaseContext().getResources().getDisplayMetrics());
                        }

                        recreate();
                    }
                }
            };

            new AlertDialog.Builder(this)
                    .setTitle(R.string.dialog_title_select_language)
                    .setSingleChoiceItems(R.array.dialog_array_language,
                            (setLanguage.get()) ? 0 : 1,
                            new DialogInterface.OnClickListener()
                            {
                                @Override
                                public void onClick(DialogInterface dialog, int which)
                                {
                                    setLanguage.set(which == 0);
                                }
                            })
                    .setPositiveButton(R.string.dialog_text_okay, listener)
                    .setNegativeButton(R.string.dialog_text_cancel, listener)
                    .create()
                    .show();
            return;
		}
		else 
		{
			throw new IllegalArgumentException("Drawer item not recognized: "
					+ itemName);
		}

		if (fragment == null)
            return;

		setActionBarTitle(itemName);
		FragmentManager fragmentManager = getSupportFragmentManager();
		if (fragmentManager.findFragmentByTag(fragmentTag) == null)
		{
			fragmentManager.popBackStackImmediate(null, 
					FragmentManager.POP_BACK_STACK_INCLUSIVE);
			fragmentManager.beginTransaction()
				.setCustomAnimations(R.anim.slide_in_right, R.anim.slide_out_left)
				.replace(R.id.fl_nav_fragment_container, fragment, fragmentTag)
				.commit();
		}
		else
		{
			fragmentManager.popBackStack(fragmentTag + suffix, FragmentManager.POP_BACK_STACK_INCLUSIVE);
		}
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu)
    {
        if (!mNavigationDrawerFragment.isDrawerOpen())
        {
            // Only show items in the action bar relevant to this screen
            // if the drawer is not showing. Otherwise, let the drawer
            // decide what to show in the action bar.
            getMenuInflater().inflate(R.menu.navigation, menu);
            return true;
        }
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        switch(item.getItemId())
        {
            case R.id.action_settings:
                openSettings(null);
                return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onBackPressed()
    {
        if (mNavigationDrawerFragment.isDrawerOpen())
            mNavigationDrawerFragment.closeDrawer();
        else
            super.onBackPressed();
    }
	
	/**
	 * Sets the title in the activity action bar to {@code title}.
	 *
	 * @param title title for activity
	 */
	private void setActionBarTitle(String title)
	{
		ActionBar actionBar = getSupportActionBar();
        if (actionBar != null)
            actionBar.setTitle(title);
	}

    /**
     * Displays the application's settings to the user.
     * @param src source of onClick call
     */
    @SuppressWarnings("UnusedParameters")   // View parameter only required for onClick
                                            // attribute in XML
    public void openSettings(View src)
    {
		if (mNavigationDrawerFragment.isDrawerOpen())
            mNavigationDrawerFragment.closeDrawer();
        // TODO: open settings
        Log.i(TAG, "TODO: Open settings");
    }
}
