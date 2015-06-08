package ca.josephroque.uottawacampusnavigator.fragment.navigation;

import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.Fragment;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import ca.josephroque.uottawacampusnavigator.R;
import ca.josephroque.uottawacampusnavigator.adapter.LinksAdapter;
import ca.josephroque.uottawacampusnavigator.util.Constants;
import ca.josephroque.uottawacampusnavigator.util.DividerItemDecoration;
import ca.josephroque.uottawacampusnavigator.util.ExternalUtil;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link LinksFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class LinksFragment extends Fragment
    implements LinksAdapter.LinkAdapterCallback
{
    /** Identifies output from this class in Logcat. */
    @SuppressWarnings("unused")
    private static final String TAG = "LinksFragment";

    // Constant values

	/** Remembers which useful_links array is to be displayed. */
    private static final String ARG_LINKS_ARRAY = "arg_links_array";
	/** Remembers depth of fragment, i.e. how many clicks from top LinksFragment. */
    private static final String ARG_DEPTH = "arg_depth";
	/** Remembers name of the list this fragment's parent displays. */
	private static final String ARG_PARENT_LIST = "arg_parent_list";
	/** Remembers name of the list this fragment displays. */
	private static final String ARG_LIST_NAME = "arg_list_name";

    // Objects

    // Arrays, data structures

    // Primitive variables

	/** Indicates which useful_links array this fragment displays. */
    private int mLinksArray;
	/** Indicates depth from top LinksFragment in backstack. */
    private int mDepth;
	/** Name of list which this fragment's parent displays. */
	private String mParentList;
	/** Name of list which this fragment displays. */
	private String mListName;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param linksArray determines useful_links array which this fragment will display
     * @param depth how many levels deep this fragment is
     * @param parentList name of parent list, or {@code null} if there isn't one
     * @param listName name of list
     * @return A new instance of fragment LinksFragment
     */
    public static LinksFragment newInstance(int linksArray,
                                            int depth,
                                            String parentList,
                                            @NonNull String listName)
    {
        LinksFragment fragment = new LinksFragment();
        Bundle args = new Bundle();
        args.putInt(ARG_LINKS_ARRAY, linksArray);
        args.putInt(ARG_DEPTH, depth);
		args.putString(ARG_PARENT_LIST, parentList);
		args.putString(ARG_LIST_NAME, listName);
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
			mParentList = bundle.getString(ARG_PARENT_LIST);
			mListName = bundle.getString(ARG_LIST_NAME);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        // Inflate the layout for this fragment
        RecyclerView recyclerView = (RecyclerView)
                inflater.inflate(R.layout.fragment_recyclerview, container, false);

        LinksAdapter linksAdapter = new LinksAdapter(this, getResources(), mLinksArray, mDepth != 0,
                mParentList, mListName);
        recyclerView.setAdapter(linksAdapter);
        recyclerView.setLayoutManager(new LinearLayoutManager(
                getActivity().getApplicationContext()));
        recyclerView.addItemDecoration(
                new DividerItemDecoration(getActivity().getApplicationContext(),
                        LinearLayout.VERTICAL));

        return recyclerView;
    }

    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);
        outState.putInt(ARG_LINKS_ARRAY, mLinksArray);
        outState.putInt(ARG_DEPTH, mDepth);
		outState.putString(ARG_PARENT_LIST, mParentList);
		outState.putString(ARG_LIST_NAME, mListName);
    }

    @Override
    public void openSublinks(int linksArray, String listTitle)
    {
        getActivity().getSupportFragmentManager().beginTransaction()
                .setCustomAnimations(R.anim.slide_in_right, R.anim.slide_out_left,
                        R.anim.slide_in_left, R.anim.slide_out_right)
                .replace(R.id.fl_nav_fragment_container,
                        LinksFragment.newInstance(linksArray, mDepth + 1, mListName, listTitle),
                        Constants.FRAGMENT_LINKS + (mDepth + 1))
                .addToBackStack(Constants.FRAGMENT_LINKS + mDepth)
                .commit();
    }

    @Override
    public void openHyperlink(String link)
    {
        ExternalUtil.openLinkInBrowser(getActivity(), link);
    }

    @Override
    public void promptCallPhoneNumber(String phoneNumber)
    {
        ExternalUtil.dialPhoneNumber(getActivity(), phoneNumber);
    }
	
	@Override
	public void moveUpList()
	{
		getActivity().getSupportFragmentManager()
				.popBackStack();
	}
}
