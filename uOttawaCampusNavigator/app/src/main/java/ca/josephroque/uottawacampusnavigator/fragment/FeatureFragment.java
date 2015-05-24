package ca.josephroque.uottawacampusnavigator.fragment;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.DecelerateInterpolator;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.Space;
import android.widget.TextView;

import ca.josephroque.uottawacampusnavigator.R;
import ca.josephroque.uottawacampusnavigator.utility.DataFormatter;

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

    /** Displays an image representing the feature being displayed */
    private ImageView mImageViewFeature;
    /** Displays text describing the feature being displayed */
    private TextView mTextViewFeatureDescription;

    /** The feature being highlighted by this instance */
    private byte mFeature;
    /** Indicates if the animation for the fragment has been completed already, so it isn't run again */
    private boolean mAnimationCompleted;

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
        RelativeLayout rootView = (RelativeLayout)inflater.inflate(R.layout.fragment_feature, container, false);
        RelativeLayout.LayoutParams layoutParams;

        //Density of screen to set proper width/height of views
        final float screenDensity = getResources().getDisplayMetrics().density;

        mImageViewFeature = new ImageView(getActivity());
        mImageViewFeature.setId(R.id.iv_feature);
        mImageViewFeature.setAdjustViewBounds(true);
        mImageViewFeature.setScaleType(ImageView.ScaleType.FIT_XY);

        final int dp_16 = DataFormatter.getPixelsFromDP(screenDensity, 16);
        mTextViewFeatureDescription = new TextView(getActivity());
        mTextViewFeatureDescription.setId(R.id.tv_feature);
        mTextViewFeatureDescription.setPadding(dp_16, dp_16, dp_16, dp_16);
        mTextViewFeatureDescription.setGravity(Gravity.CENTER_HORIZONTAL);
        mTextViewFeatureDescription.setTextAppearance(getActivity(), android.R.style.TextAppearance_Large);
        mTextViewFeatureDescription.setTextColor(getResources().getColor(R.color.primary_text));

        // Adds two views to the fragment, an ImageView and a TextView
        // Alternates between placing ImageView above TextView and vice versa
        if (mFeature % 2 == 0)
        {
            rootView.setBackgroundColor(getResources().getColor(R.color.primary_garnet));

            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
            rootView.addView(mTextViewFeatureDescription, layoutParams);

            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            layoutParams.addRule(RelativeLayout.BELOW, R.id.tv_feature);
            rootView.addView(mImageViewFeature, layoutParams);
        }
        else
        {
            rootView.setBackgroundColor(getResources().getColor(R.color.primary_gray));

            Space emptySpace = new Space(getActivity());
            emptySpace.setId(R.id.space_feature);
            layoutParams = new RelativeLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    getActivity().findViewById(R.id.rl_intro_toolbar).getHeight());
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
            rootView.addView(emptySpace, layoutParams);

            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            layoutParams.addRule(RelativeLayout.ABOVE, R.id.space_feature);
            rootView.addView(mTextViewFeatureDescription, layoutParams);

            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            layoutParams.addRule(RelativeLayout.ABOVE, R.id.tv_feature);
            rootView.addView(mImageViewFeature, layoutParams);
        }

        // TODO: create layout for each feature
        // 1 - navigation
        // 2 - scheduling
        // 3 - bus information
        // 4 - accessibility
        // 5 - useful links

        mImageViewFeature.setVisibility(View.INVISIBLE);
        mTextViewFeatureDescription.setVisibility(View.INVISIBLE);

        switch(mFeature)
        {
            case 0:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_0);
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

        if (FeatureFragment.this.isVisible() && mFeature == 0)
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
        if (mAnimationCompleted)
            return;

        final int longAnimDuration = getResources().getInteger(android.R.integer.config_longAnimTime);
        mAnimationCompleted = true;

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
                        mImageViewFeature.setY(mImageViewFeature.getY()
                                + 50 * (mFeature % 2 == 0 ? 1 : -1));
                        mImageViewFeature.animate()
                                .alpha(1f)
                                .yBy(50 * (mFeature % 2 == 0 ? -1 : 1))
                                .setDuration(longAnimDuration)
                                .setInterpolator(new DecelerateInterpolator())
                                .start();
                    }
                })
                .start();
    }
}
