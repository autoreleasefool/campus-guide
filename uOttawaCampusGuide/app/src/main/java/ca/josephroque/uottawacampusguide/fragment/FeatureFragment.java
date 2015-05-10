package ca.josephroque.uottawacampusguide.fragment;

import android.app.Activity;
import android.graphics.drawable.Drawable;
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
 * Activities that contain this fragment must implement the
 * {@link FeatureFragment.OnFeatureClosedListener} interface
 * to handle interaction events.
 * Use the {@link FeatureFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class FeatureFragment extends Fragment
{
    private static final String ARG_FEATURE = "feature";
    private static final byte MAX_FEATURES = 5;

    private OnFeatureClosedListener mListener;

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

        ((TextView)rootView.findViewById(R.id.tv_temp)).setText("Hello, " + feature);

        return rootView;
    }

    @Override
    public void onAttach(Activity activity)
    {
        super.onAttach(activity);
        try
        {
            mListener = (OnFeatureClosedListener) activity;
        } catch (ClassCastException e)
        {
            throw new ClassCastException(activity.toString()
                    + " must implement OnFeatureClosedListener");
        }
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

    @Override
    public void onDetach()
    {
        super.onDetach();
        mListener = null;
    }

    public static byte getMaxFeatures() {return MAX_FEATURES;}

    /**
     * This interface must be implemented by activities that contain this
     * fragment to allow an interaction in this fragment to be communicated
     * to the activity and potentially other fragments contained in that
     * activity.
     */
    public interface OnFeatureClosedListener
    {
        void onFeatureClosed();
    }

}
