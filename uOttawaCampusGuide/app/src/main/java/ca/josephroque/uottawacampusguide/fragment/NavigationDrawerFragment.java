package ca.josephroque.uottawacampusguide.fragment;

import android.app.ActionBar;
import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import ca.josephroque.uottawacampusguide.Constants;
import ca.josephroque.uottawacampusguide.MainActivity;
import ca.josephroque.uottawacampusguide.R;
import ca.josephroque.uottawacampusguide.adapter.DrawerAdapter;
import ca.josephroque.uottawacampusguide.utility.DividerItemDecoration;


/**
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link NavigationDrawerFragment.NavigationCallbacks} interface
 * to handle interaction events.
 */
public class NavigationDrawerFragment extends Fragment
{

    private static final String TAG = "NavigationDrawer";

    /**
     * Per the design guidelines, you should show the drawer on launch until the user manually
     * expands it. This shared preference tracks this.
     */
    private static final String PREF_USER_LEARNED_DRAWER = "navigation_drawer_learned";

    private RecyclerView mRecyclerViewDrawerItems;
    private DrawerLayout mDrawerLayout;
    private DrawerAdapter mDrawerAdapter;
    private ActionBarDrawerToggle mDrawerToggle;
    private View mFragmentContainerView;
    private boolean mUserLearnedDrawer;

    private NavigationCallbacks mCallback;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        // Inflate the layout for this fragment
        View rootView = inflater.inflate(R.layout.fragment_navigation_drawer, container, false);

        String appVersionName;
        try
        {
            appVersionName = "v" + getActivity().getPackageManager().getPackageInfo(
                    getActivity().getPackageName(), 0).versionName;
        }
        catch (PackageManager.NameNotFoundException ex)
        {
            appVersionName = "v1.0";
        }
        ((TextView) rootView.findViewById(R.id.tv_navigation_app_version))
                .setText(appVersionName);

        rootView.findViewById(R.id.iv_navigation_settings).setOnClickListener(new View.OnClickListener()
        {
            @Override
            public void onClick(View v)
            {
                mCallback.navigationSettingsClicked();
            }
        });

        mRecyclerViewDrawerItems = (RecyclerView) rootView.findViewById(R.id.rv_navigation);
        mRecyclerViewDrawerItems.setHasFixedSize(true);
        mRecyclerViewDrawerItems.addItemDecoration(
                new DividerItemDecoration(getActivity(), LinearLayoutManager.VERTICAL));
        RecyclerView.LayoutManager layoutManager = new LinearLayoutManager(getActivity());
        mRecyclerViewDrawerItems.setLayoutManager(layoutManager);
        mDrawerAdapter = new DrawerAdapter((MainActivity)getActivity());
        mRecyclerViewDrawerItems.setAdapter(mDrawerAdapter);

        Log.i(TAG, "Drawer fragment created");

        return rootView;
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        SharedPreferences preferences =
                getActivity().getSharedPreferences(Constants.PREFERENCES, Context.MODE_PRIVATE);
        mUserLearnedDrawer = preferences.getBoolean(PREF_USER_LEARNED_DRAWER, false);
    }

    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        try
        {
            mCallback = (NavigationCallbacks) activity;
        } catch (ClassCastException e)
        {
            throw new ClassCastException(activity.toString()
                    + " must implement NavigationCallbacks");
        }
    }

    @Override
    public void onDetach()
    {
        super.onDetach();
        mCallback = null;
    }

    public void setup(int fragmentId, DrawerLayout drawerLayout)
    {
        mFragmentContainerView = getActivity().findViewById(fragmentId);
        mDrawerLayout = drawerLayout;
        mDrawerToggle = new ActionBarDrawerToggle(
                getActivity(),
                mDrawerLayout,
                R.string.navigation_drawer_open,
                R.string.navigation_drawer_close)
        {

            @Override
            public void onDrawerClosed(View view)
            {
                super.onDrawerClosed(view);
                getActivity().invalidateOptionsMenu();
            }

            @Override
            public void onDrawerOpened(View view)
            {
                super.onDrawerOpened(view);
                getActivity().invalidateOptionsMenu();

                if (!mUserLearnedDrawer)
                {
                    mUserLearnedDrawer = true;
                    getActivity().getSharedPreferences(Constants.PREFERENCES, Context.MODE_PRIVATE)
                            .edit()
                            .putBoolean(PREF_USER_LEARNED_DRAWER, true)
                            .apply();
                }
            }
        };
        mDrawerLayout.setDrawerListener(mDrawerToggle);

        ActionBar actionBar = getActivity().getActionBar();
        if (actionBar != null)
        {
            actionBar.setDisplayHomeAsUpEnabled(true);
            actionBar.setHomeButtonEnabled(true);
        }

        if (!mUserLearnedDrawer)
        {
            mDrawerLayout.openDrawer(mFragmentContainerView);
        }

        Log.i(TAG, "Drawer setup");
    }

    /**
     * Returns true if the navigation drawer is currently open, false otherwise
     * @return true if the drawer is open, false otherwise
     */
    public boolean isDrawerOpen() {return mDrawerLayout.isDrawerOpen(Gravity.START);}

    /**
     * This interface must be implemented by activities that contain this
     * fragment to allow an interaction in this fragment to be communicated
     * to the activity and potentially other fragments contained in that
     * activity.
     */
    public interface NavigationCallbacks
    {
        void navigationSettingsClicked();
    }

}
