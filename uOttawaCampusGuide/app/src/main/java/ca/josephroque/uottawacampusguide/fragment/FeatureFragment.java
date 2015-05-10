package ca.josephroque.uottawacampusguide.fragment;

import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;
import android.widget.TextView;

import ca.josephroque.uottawacampusguide.R;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link FeatureFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class FeatureFragment extends Fragment
{
    /** Identifies feature which the fragment highlights */
    private static final String ARG_FEATURE = "feature";
    /** Total number of possible features this fragment may highlight */
    public static final byte MAX_FEATURES = 5;

    /** The feature being highlighted by this instance */
    private byte feature;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param feature Feature which will be displayed by this instance.
     * @return A new instance of fragment FeatureFragment.
     */
    public static FeatureFragment newInstance(byte feature)
    {
        FeatureFragment fragment = new FeatureFragment();
        Bundle args = new Bundle();
        args.putByte(ARG_FEATURE, feature);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        Bundle args = (savedInstanceState == null) ? getArguments() : savedInstanceState;
        if (args != null)
        {
            feature = args.getByte(ARG_FEATURE);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        // Inflate the layout for this fragment
        RelativeLayout rootView = (RelativeLayout)inflater.inflate(R.layout.fragment_feature, container, false);

        // TODO: create layout for each feature
        // 1 - navigation
        // 2 - scheduling
        // 3 - bus information
        // 4 - accessibility
        // 5 - useful links

        return rootView;
    }

    @Override
    public void onResume()
    {
        super.onResume();
    }

    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);
        outState.putByte(ARG_FEATURE, feature);
    }
}
