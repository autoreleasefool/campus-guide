package ca.josephroque.uottawacampusguide.fragment;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

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

    private RecyclerView mRecyclerViewDrawerItems;
    private DrawerAdapter mDrawerAdapter;

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

        return rootView;
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
