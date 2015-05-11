package ca.josephroque.uottawacampusguide.fragment;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.DecelerateInterpolator;
import android.widget.ImageView;
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

    private ImageView mImageViewFeature;
    private TextView mTextViewFeatureDescription;

    /** The feature being highlighted by this instance */
    private byte mFeature;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param feature Feature which will be displayed by this instance.
     * @return A new instance of fragment FeatureFragment.
     * @throws IllegalArgumentException if feature is not above 0 and less than {@code MAX_FEATURES}
     */
    public static FeatureFragment newInstance(byte feature)
    {
        if (feature < 0 || feature >= MAX_FEATURES)
            throw new IllegalArgumentException("feature must be between 0 and " + (MAX_FEATURES - 1));

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
            mFeature = args.getByte(ARG_FEATURE);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState)
    {
        // Inflate the layout for this fragment

        //TODO: textview in inverted shows up beneath indicators. Need to move up.
        RelativeLayout rootView;
        if (mFeature % 2 == 0)
            rootView = (RelativeLayout)inflater.inflate(R.layout.fragment_feature, container, false);
        else
            rootView = (RelativeLayout)inflater.inflate(R.layout.fragment_feature_inverted, container, false);

        rootView.setBackgroundColor(getResources().getColor(
                (mFeature % 2 == 0)
                ? R.color.primary_garnet
                : R.color.primary_gray));

        mImageViewFeature = (ImageView)rootView.findViewById(R.id.iv_feature);
        mTextViewFeatureDescription = (TextView)rootView.findViewById(R.id.tv_feature);

        // TODO: create layout for each feature
        // 1 - navigation
        // 2 - scheduling
        // 3 - bus information
        // 4 - accessibility
        // 5 - useful links

        switch(mFeature)
        {
            case 0:
                mImageViewFeature.setImageResource(R.drawable.googlemaps_campus);
                mImageViewFeature.setVisibility(View.INVISIBLE);

                mTextViewFeatureDescription.setText(R.string.text_feature_description_0);
                mTextViewFeatureDescription.setVisibility(View.INVISIBLE);
                break;
            case 1:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_1);
                break;
            case 2:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_2);
                break;
            case 3:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_3);
                break;
            case 4:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_4);
                break;
            default:
                throw new IllegalStateException(this.toString() + ": mFeature must be between 0-"
                        + (MAX_FEATURES - 1));
        }

        return rootView;
    }

    @Override
    public void onResume()
    {
        super.onResume();

        if (FeatureFragment.this.isVisible())
            startAnimation();
    }

    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);
        outState.putByte(ARG_FEATURE, mFeature);
    }

    public void startAnimation()
    {
        final int longAnimDuration = getResources().getInteger(android.R.integer.config_longAnimTime);
        switch(mFeature)
        {
            case 0:
                mTextViewFeatureDescription.setAlpha(0f);
                mTextViewFeatureDescription.setVisibility(View.VISIBLE);
                mTextViewFeatureDescription.animate()
                        .alpha(1f)
                        .setDuration(longAnimDuration)
                        .setListener(new AnimatorListenerAdapter()
                        {
                            @Override
                            public void onAnimationEnd(Animator animation)
                            {
                                mImageViewFeature.setAlpha(0f);
                                mImageViewFeature.setVisibility(View.VISIBLE);
                                mImageViewFeature.setY(mImageViewFeature.getY() + 50);
                                mImageViewFeature.animate()
                                        .alpha(1f)
                                        .yBy(-50)
                                        .setDuration(longAnimDuration)
                                        .setInterpolator(new DecelerateInterpolator())
                                        .start();
                            }
                        })
                        .start();
                break;
        }
    }
}
