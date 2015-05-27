package ca.josephroque.uottawacampusnavigator.fragment.navigation;


import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import ca.josephroque.uottawacampusnavigator.R;
import ca.josephroque.uottawacampusnavigator.adapter.LinksAdapter;
import ca.josephroque.uottawacampusnavigator.utility.Constants;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link LinksFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class LinksFragment extends Fragment
    implements LinksAdapter.LinkAdapterCallback
{

    private static final String ARG_LINKS_ARRAY = "arg_links_array";
    private static final String ARG_DEPTH = "arg_depth";

    private int mLinksArray;
    private int mDepth;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param linksArray determines useful_links array which this fragment will display
     * @param depth how many levels deep this fragment is
     * @return A new instance of fragment LinksFragment
     */
    public static LinksFragment newInstance(int linksArray, int depth)
    {
        LinksFragment fragment = new LinksFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_LINKS_ARRAY, linksArray);
        args.putInt(ARG_DEPTH, depth);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        Bundle bundle = (savedInstanceState != null) ? savedInstanceState : getArguments();
        if (bundle != null)
        {
            mLinksArray = bundle.getInt(ARG_LINKS_ARRAY);
            mDepth = bundle.getInt(ARG_DEPTH);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        // Inflate the layout for this fragment
        RecyclerView recyclerView = (RecyclerView)
                inflater.inflate(R.layout.fragment_recyclerview, container, false);

        LinksAdapter linksAdapter = new LinksAdapter(this, getResources(), mLinksArray);
        recyclerView.setAdapter(linksAdapter);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));

        return recyclerView;
    }


    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);
        outState.putInt(ARG_LINKS_ARRAY, mLinksArray);
        outState.putInt(ARG_DEPTH, mDepth);
    }

    @Override
    public void openSublinks(int linksArray)
    {
        getActivity().getSupportFragmentManager().beginTransaction()
                .replace(R.id.fl_nav_fragment_container,
                        LinksFragment.newInstance(linksArray, mDepth + 1),
                        Constants.FRAGMENT_LINKS + (mDepth + 1))
                .setCustomAnimations(R.anim.slide_in_right, R.anim.slide_out_left,
                        R.anim.slide_in_left, R.anim.slide_out_right)
                .addToBackStack(Constants.FRAGMENT_LINKS + mDepth)
                .commit();
    }

    @Override
    public void openHyperlink(String link)
    {
        // TODO: open link in  browser window
    }

    @Override
    public void promptCallPhoneNumber(String phoneNumber)
    {
        // TODO: prompt user to call phone number
    }
}
