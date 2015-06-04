package ca.josephroque.uottawacampusnavigator.fragment;

import android.app.Activity;
import android.content.res.Resources;
import android.support.v7.app.ActionBar;
import android.support.v4.app.Fragment;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;

import ca.josephroque.uottawacampusnavigator.R;
import ca.josephroque.uottawacampusnavigator.adapter.DrawerAdapter;
import ca.josephroque.uottawacampusnavigator.util.Constants;

/**
 * Fragment used for managing interactions for and presentation of a navigation drawer.
 * See the <a href="https://developer.android.com/design/patterns/navigation-drawer.html#Interaction">
 * design guidelines</a> for a complete explanation of the behaviors implemented here.
 */
public class NavigationDrawerFragment extends Fragment
    implements DrawerAdapter.DrawerAdapterCallbacks
{

    /** Identifies output from this class in Logcat. */
    private static final String TAG = "NavigationDrawer";

    /** Remember the position of the current selected item. */
    private static final String ARG_STATE_SELECTED_POSITION = "arg_navigation_drawer_position";

    /**
     * Per the design guidelines, you should show the drawer on launch until the user manually
     * expands it. This shared preference tracks this.
     */
    private static final String PREF_USER_LEARNED_DRAWER = "pref_navigation_drawer_learned";
	
	/** Icons for items which appear in the navigation drawer. */
	private static final int[] NAVIGATION_DRAWER_ICONS = {
			R.drawable.ic_home,
			R.drawable.ic_navigation,
			R.drawable.ic_star,
			R.drawable.ic_link,
			R.drawable.ic_bus,
			R.drawable.ic_accessibility,
			R.drawable.ic_whatshot,
			R.drawable.ic_settings,
			R.drawable.ic_help,
			R.drawable.ic_language,
	};
	
	/** Colors for icons when they are highlighted. */
	private static final int[] NAVIGATION_DRAWER_HIGHLIGHTS = {
			R.color.nav_home_highlight,
			R.color.nav_navigation_highlight,
			R.color.nav_star_highlight,
			R.color.nav_link_highlight,
			R.color.nav_bus_highlight,
			R.color.nav_accessibility_highlight,
			R.color.nav_whatshot_highlight,
			R.color.nav_settings_highlight,
			R.color.nav_help_highlight,
			R.color.nav_language_highlight,
	};
	
	/** Items which will appear in the navigation drawer. */
	private static String[] NAVIGATION_DRAWER_ITEMS;

    /** Indicates if the highlights have been converted to actual colors values. */
    private static boolean sHighlightsConverted = false;

    /** Instance of callback interface. */
    private NavigationDrawerCallbacks mCallback;

    /** Helper component that ties the action bar to the navigation drawer. */
    private ActionBarDrawerToggle mDrawerToggle;

    /** Layout for the navigation drawer. */
    private DrawerLayout mDrawerLayout;
    /** Container for fragments. */
    private View mFragmentContainerView;

    /** Current position of the navigation drawer. */
    private int mCurrentSelectedPosition = 0;
    /** Indicates whether this fragment was loaded from a saved instance state. */
    private boolean mFromSavedInstanceState;
    /** Indicates whether the user has 'learned' about the navigation drawer. */
    private boolean mUserLearnedDrawer;

    @Override
    public void onActivityCreated(Bundle savedInstanceState)
    {
        super.onActivityCreated(savedInstanceState);
        setHasOptionsMenu(true);
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        // Read in the flag indicating whether or not the user has demonstrated awareness of the
        // drawer. See PREF_USER_LEARNED_DRAWER for details.
        SharedPreferences sp = PreferenceManager.getDefaultSharedPreferences(getActivity());
        mUserLearnedDrawer = sp.getBoolean(PREF_USER_LEARNED_DRAWER, false);
		
		boolean appIsEnglish = sp.getBoolean(Constants.PREF_LANGUAGE_SELECTED, true);
		NAVIGATION_DRAWER_ITEMS = (appIsEnglish)
				? Constants.NAVIGATION_DRAWER_ITEMS_EN
				: Constants.NAVIGATION_DRAWER_ITEMS_FR;

        if (savedInstanceState != null)
        {
            mCurrentSelectedPosition = savedInstanceState.getInt(ARG_STATE_SELECTED_POSITION, 0);
            mFromSavedInstanceState = true;
        }

        onDrawerItemClicked(mCurrentSelectedPosition);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        RecyclerView recyclerView = (RecyclerView) inflater.inflate(
                R.layout.fragment_recyclerview, container, false);
				
		if (!sHighlightsConverted)
			convertHighlights(getResources());

        DrawerAdapter drawerAdapter = new DrawerAdapter(this,
                NAVIGATION_DRAWER_ICONS,
				NAVIGATION_DRAWER_HIGHLIGHTS,
                NAVIGATION_DRAWER_ITEMS);
        drawerAdapter.addSeparator(Constants.NAVIGATION_ITEM_SETTINGS);
        recyclerView.setAdapter(drawerAdapter);
        recyclerView.setLayoutManager(new LinearLayoutManager(
                getActivity().getApplicationContext()));
        return recyclerView;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        return mDrawerToggle.onOptionsItemSelected(item) || super.onOptionsItemSelected(item);
    }

    /**
     * Checks if the navigation drawer is open.
     * @return true if the drawer is fully open, false otherwise
     */
    public boolean isDrawerOpen()
    {
        return mDrawerLayout != null && mDrawerLayout.isDrawerOpen(mFragmentContainerView);
    }

    /**
     * Users of this fragment must call this method to set up the navigation drawer interactions.
     *
     * @param fragmentId   The android:id of this fragment in its activity's layout
     * @param drawerLayout The DrawerLayout containing this fragment's UI
     */
    public void setUp(int fragmentId, DrawerLayout drawerLayout)
    {
        mFragmentContainerView = getActivity().findViewById(fragmentId);
        mDrawerLayout = drawerLayout;

        // set a custom shadow that overlays the main content when the drawer opens
        mDrawerLayout.setDrawerShadow(R.drawable.drawer_shadow, GravityCompat.START);
        // set up the drawer's list view with items and click listener

        ActionBar actionBar = ((AppCompatActivity) getActivity()).getSupportActionBar();
        if (actionBar != null)
        {
            actionBar.setDisplayHomeAsUpEnabled(true);
            actionBar.setHomeButtonEnabled(true);
        }

        // ActionBarDrawerToggle ties together the the proper interactions
        // between the navigation drawer and the action bar app icon.
        mDrawerToggle = new ActionBarDrawerToggle(
                getActivity(),                    /* host Activity */
                mDrawerLayout,                    /* DrawerLayout object */
                R.string.navigation_drawer_open,  /* "open drawer" description for accessibility */
                R.string.navigation_drawer_close  /* "close drawer" description for accessibility */
        )
        {
            @Override
            public void onDrawerClosed(View drawerView)
            {
                super.onDrawerClosed(drawerView);
                if (!isAdded())
                {
                    return;
                }

                getActivity().supportInvalidateOptionsMenu(); // calls onPrepareOptionsMenu()
            }

            @Override
            public void onDrawerOpened(View drawerView)
            {
                super.onDrawerOpened(drawerView);
                if (!isAdded())
                {
                    return;
                }

                if (!mUserLearnedDrawer)
                {
                    // The user manually opened the drawer; store this flag to prevent auto-showing
                    // the navigation drawer automatically in the future.
                    mUserLearnedDrawer = true;
                    SharedPreferences sp = PreferenceManager
                            .getDefaultSharedPreferences(getActivity());
                    sp.edit().putBoolean(PREF_USER_LEARNED_DRAWER, true).apply();
                }

                getActivity().supportInvalidateOptionsMenu(); // calls onPrepareOptionsMenu()
            }
        };

        // If the user hasn't 'learned' about the drawer, open it to introduce them to the drawer,
        // per the navigation drawer design guidelines.
        if (!mUserLearnedDrawer && !mFromSavedInstanceState)
        {
            mDrawerLayout.openDrawer(mFragmentContainerView);
        }
		
		mDrawerLayout.setDrawerListener(mDrawerToggle);

        // Defer code dependent on restoration of previous instance state.
        mDrawerLayout.post(new Runnable()
        {
            @Override
            public void run()
            {
                mDrawerToggle.syncState();
            }
        });

        getActivity().invalidateOptionsMenu();
    }

    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        try
        {
            mCallback = (NavigationDrawerCallbacks) activity;
        } catch (ClassCastException e)
        {
            throw new ClassCastException("Activity must implement NavigationDrawerCallbacks.");
        }
    }

    @Override
    public void onDetach()
    {
        super.onDetach();
        mCallback = null;
    }

    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);
        outState.putInt(ARG_STATE_SELECTED_POSITION, mCurrentSelectedPosition);
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig)
    {
        super.onConfigurationChanged(newConfig);
        // Forward the new configuration the drawer toggle component.
        mDrawerToggle.onConfigurationChanged(newConfig);
    }

    @Override
    public void onDrawerItemClicked(int position)
    {
        mCurrentSelectedPosition = position;
        if (mDrawerLayout != null)
            mDrawerLayout.closeDrawer(mFragmentContainerView);
        if (mCallback != null)
            mCallback.onNavigationDrawerItemSelected(
					NAVIGATION_DRAWER_ITEMS[mCurrentSelectedPosition]);
    }
	
	@Override
	public int getCurrentPosition()
	{
		return mCurrentSelectedPosition;
	}

    /**
     * Converts values in {@code NAVIGAION_DRAWER_HIGHLIGHTS} from color ids to their
     * integer values.
     * @param resources to get color represented by ids
     */
	private static void convertHighlights(Resources resources)
	{
		for (int i = 0; i < NAVIGATION_DRAWER_HIGHLIGHTS.length; i++)
		{
			NAVIGATION_DRAWER_HIGHLIGHTS[i] =
				resources.getColor(NAVIGATION_DRAWER_HIGHLIGHTS[i]);
		}
		sHighlightsConverted = true;
	}

    /**
     * Closes the navigation drawer.
     */
    public void closeDrawer()
    {
        if (mDrawerLayout != null)
            mDrawerLayout.closeDrawer(GravityCompat.START);
    }

    /**
     * Callbacks interface that all activities using this fragment must implement.
     */
    public interface NavigationDrawerCallbacks
    {
        /**
         * Called when an item in the navigation drawer is selected.
		 * @param itemName name of the selected item
         */
        void onNavigationDrawerItemSelected(String itemName);
    }
}
