package ca.josephroque.uottawacampusnavigator.fragment.intro;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.Log;
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
import ca.josephroque.uottawacampusnavigator.util.DataFormatter;

/**
 * A simple {@link Fragment} subclass. Use the {@link FeatureFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class FeatureFragment
        extends Fragment
{

    /** Identifies output from this class in Logcat. */
    @SuppressWarnings("unused")
    private static final String TAG = "FeatureFragment";

    /** Identifies feature which the fragment highlights. */
    private static final String ARG_FEATURE = "feature";

    /** Total number of possible features this fragment may highlight. */
    public static final byte MAX_FEATURES = 5;
    /** Represents feature describing navigation. */
    private static final byte FEATURE_NAVIGATION = 0;
    /** Represents feature describing scheduling. */
    private static final byte FEATURE_SCHEDULE = 1;
    /** Represents feature describing bus information. */
    private static final byte FEATURE_BUS_INFO = 2;
    /** Represents feature describing accessibility options. */
    private static final byte FEATURE_ACCESSIBLE = 3;
    /** Represents feature describing useful links within the application. */
    private static final byte FEATURE_USEFUL_LINKS = 4;

    /** Distance to animate position offset of views. */
    private static final int ANIMATION_POSITION_OFFSET = 50;

    /** Displays an image representing the feature being displayed. */
    private ImageView mImageViewFeature;
    /** Displays text describing the feature being displayed. */
    private TextView mTextViewFeatureDescription;

    /** The feature being highlighted by this instance. */
    private byte mFeature;
    /** Indicates if the animation for the fragment has been completed already. */
    private boolean mAnimationCompleted;

    /**
     * Use this factory method to create a new instance of this fragment using the provided
     * parameters.
     *
     * @param feature Feature which will be displayed by this instance
     * @return A new instance of fragment FeatureFragment
     * @throws IllegalArgumentException if feature is not above 0 and less than {@code
     * MAX_FEATURES}
     */
    public static FeatureFragment newInstance(byte feature)
    {
        if (feature < 0 || feature >= MAX_FEATURES)
            throw new IllegalArgumentException("feature must be between 0 and "
                    + (MAX_FEATURES - 1));

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

        Bundle args = (savedInstanceState == null)
                ? getArguments()
                : savedInstanceState;
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
        RelativeLayout rootView =
                (RelativeLayout) inflater.inflate(R.layout.fragment_feature, container, false);

        setupFeatureImageAndText();
        adjustFeatureLayout(rootView, mFeature % 2 == 0);

        return rootView;
    }

    @Override
    public void onResume()
    {
        super.onResume();

        if (isVisible() && mFeature == 0)
            startAnimation();
    }

    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);
        outState.putByte(ARG_FEATURE, mFeature);
    }

    /**
     * Assigns text and an image to the views which display the specifics of the feature represented
     * by this fragment.
     */
    private void setupFeatureImageAndText()
    {
        //Density of screen to set proper width/height of views
        final float screenDensity = DataFormatter.getScreenDensity(getResources());
        final int dp16 = DataFormatter.getPixelsFromDP(screenDensity, 16);

        mImageViewFeature = new ImageView(getActivity().getApplicationContext());
        mImageViewFeature.setId(R.id.iv_feature);
        mImageViewFeature.setAdjustViewBounds(true);
        mImageViewFeature.setScaleType(ImageView.ScaleType.FIT_XY);

        mTextViewFeatureDescription = new TextView(getActivity().getApplicationContext());
        mTextViewFeatureDescription.setId(R.id.tv_feature);
        mTextViewFeatureDescription.setPadding(dp16, dp16, dp16, dp16);
        mTextViewFeatureDescription.setGravity(Gravity.CENTER_HORIZONTAL);
        mTextViewFeatureDescription.setTextAppearance(getActivity().getApplicationContext(),
                android.R.style.TextAppearance_Large);
        mTextViewFeatureDescription.setTextColor(getResources().getColor(R.color.primary_text));

        mImageViewFeature.setVisibility(View.INVISIBLE);
        mTextViewFeatureDescription.setVisibility(View.INVISIBLE);

        switch (mFeature)
        {
            case FEATURE_NAVIGATION:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_0);
                Log.i(TAG, "TODO: Feature 0 - navigation");
                break;
            case FEATURE_SCHEDULE:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_1);
                Log.i(TAG, "TODO: Feature 1 - scheduling");
                break;
            case FEATURE_BUS_INFO:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_2);
                Log.i(TAG, "TODO: Feature 2 - bus info");
                break;
            case FEATURE_ACCESSIBLE:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_3);
                Log.i(TAG, "TODO: Feature 3 - accessibility");
                break;
            case FEATURE_USEFUL_LINKS:
                mTextViewFeatureDescription.setText(R.string.text_feature_description_4);
                Log.i(TAG, "TODO: Feature 4 - useful links");
                break;
            default:
                throw new IllegalStateException("mFeature must be between 0-" + (MAX_FEATURES - 1));
        }
    }

    /**
     * The layout of each feature will alternate from the text being above the image, to below.
     * Calling this will arrange the text and image according to {@code textAboveImage}.
     *
     * @param rootView root view of fragment
     * @param textAboveImage indicates if text should be above image or vice versa.
     */
    private void adjustFeatureLayout(RelativeLayout rootView, boolean textAboveImage)
    {
        RelativeLayout.LayoutParams layoutParams;

        // Clears any existing views in root layout
        rootView.removeAllViews();

        if (textAboveImage)
        {
            rootView.setBackgroundColor(getResources().getColor(R.color.primary_garnet));

            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT);
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
            rootView.addView(mTextViewFeatureDescription, layoutParams);

            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT);
            layoutParams.addRule(RelativeLayout.BELOW, R.id.tv_feature);
            rootView.addView(mImageViewFeature, layoutParams);
        }
        else
        {
            rootView.setBackgroundColor(getResources().getColor(R.color.primary_gray));

            Space emptySpace = new Space(getActivity().getApplicationContext());
            emptySpace.setId(R.id.space_feature);
            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                    getActivity().findViewById(R.id.rl_intro_toolbar)
                            .getHeight());
            layoutParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
            rootView.addView(emptySpace, layoutParams);

            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT);
            layoutParams.addRule(RelativeLayout.ABOVE, R.id.space_feature);
            rootView.addView(mTextViewFeatureDescription, layoutParams);

            layoutParams = new RelativeLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT);
            layoutParams.addRule(RelativeLayout.ABOVE, R.id.tv_feature);
            rootView.addView(mImageViewFeature, layoutParams);
        }
    }

    /**
     * Begins animation of views.
     */
    public void startAnimation()
    {
        if (mAnimationCompleted)
            return;

        final int longAnimDuration =
                getResources().getInteger(android.R.integer.config_longAnimTime);
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
                                + ANIMATION_POSITION_OFFSET * (mFeature % 2 == 0
                                ? 1
                                : -1));
                        mImageViewFeature.animate()
                                .alpha(1f)
                                .yBy(ANIMATION_POSITION_OFFSET * (mFeature % 2 == 0
                                        ? -1
                                        : 1))
                                .setDuration(longAnimDuration)
                                .setInterpolator(new DecelerateInterpolator())
                                .start();
                    }
                })
                .start();
    }
}
