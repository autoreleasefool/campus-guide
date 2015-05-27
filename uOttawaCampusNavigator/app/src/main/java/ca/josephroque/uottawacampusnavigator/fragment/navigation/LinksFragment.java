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

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link LinksFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class LinksFragment extends Fragment
    implements LinksAdapter.LinkAdapterCallback
{

    private static final String ARG_LINKS_ARRAY = "arg_links_array";

    private int mLinksArray;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param linksArray determines useful_links array which this fragment will display
     * @return A new instance of fragment LinksFragment.
     */
    public static LinksFragment newInstance(int linksArray)
    {
        LinksFragment fragment = new LinksFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_LINKS_ARRAY, linksArray);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        if (savedInstanceState != null)
        {
            mLinksArray = savedInstanceState.getInt(ARG_LINKS_ARRAY);
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
    }

    @Override
    public void openSublinks(int linksArray)
    {
        // TODO: create new instance of links fragment
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
