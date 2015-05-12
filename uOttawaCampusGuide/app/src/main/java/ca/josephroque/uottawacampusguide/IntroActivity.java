package ca.josephroque.uottawacampusguide;

import android.content.Intent;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.util.SparseArray;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RelativeLayout;

import java.lang.ref.WeakReference;

import ca.josephroque.uottawacampusguide.fragment.FeatureFragment;
import ca.josephroque.uottawacampusguide.fragment.LanguageFragment;

/**
 * Created by Joseph Roque on 15-05-09
 * <p/>
 * Handles first time interactions with the application, provides UI to allow the user to
 * select a language and explore the functionality of the app
 */

public class IntroActivity extends ActionBarActivity
    implements LanguageFragment.OnLanguageSelectListener
{

    /** Identifier for the current feature page being displayed */
    private static final String ARG_CURRENT_PAGE = "ACP";
    /** Identifier for whether the user is selecting a language or not */
    private static final String ARG_SELECTING_LANGUAGE = "ASL";

    //TODO: documentation
    private static final float INDICATOR_ACTIVE = 0.75f;
    private static final float INDICATOR_INACTIVE = 0.25f;

    /** Adapter to manage fragments displayed by this activity */
    private IntroPagerAdapter mPagerAdapter;

    /** Displays input feedback to user, offers interactive elements */
    private RelativeLayout mRelativeLayoutToolbar;
    /** Provide feedback on user's navigation in app */
    private View[] mViewPositionIndicator;

    /** Indicates if the user is select a language*/
    private boolean mIsSelectingLanguage = true;
    /** Indicates the application should refresh the view pager fragments */
    private boolean mIgnoreSelectingLanguage = false;
    /** Current page of view pager displayed to user */
    private byte mCurrentFeaturePage = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        /*
         * If the user has already selected a language and been shown the welcome menu,
         * they are immediately sent to the main menu. Otherwise, the language fragment
         * is inflated and displayed.
         */
        //TODO: uncomment line below to skip opening activity if language was selected
        boolean languageSelected = false;//getSharedPreferences(Constants.PREFERENCES, MODE_PRIVATE).getBoolean(Constants.PREF_LANG, false);
        if (languageSelected)
        {
            Intent mainMenuIntent = new Intent(this, MainActivity.class);
            startActivity(mainMenuIntent);
            finish();
        }
        else
        {
            if (savedInstanceState != null)
            {
                mCurrentFeaturePage = savedInstanceState.getByte(ARG_CURRENT_PAGE);
                mIsSelectingLanguage = savedInstanceState.getBoolean(ARG_SELECTING_LANGUAGE);
            }

            setContentView(R.layout.activity_intro);

            //Getting references to objects, creating listeners
            ViewPager viewPager = (ViewPager)findViewById(R.id.vp_intro);
            mPagerAdapter = new IntroPagerAdapter(getSupportFragmentManager());
            viewPager.setAdapter(mPagerAdapter);

            viewPager.setOnPageChangeListener(new ViewPager.SimpleOnPageChangeListener()
            {
                @Override
                public void onPageSelected(int position)
                {
                    if (!mIsSelectingLanguage)
                    {
                        updateIndicatorPosition(position);
                        ((FeatureFragment)mPagerAdapter.getRegisteredFragment(position))
                                .startAnimation();
                    }
                }
            });

            mRelativeLayoutToolbar = (RelativeLayout)findViewById(R.id.rl_intro_toolbar);
            mRelativeLayoutToolbar.setVisibility(View.INVISIBLE);

            mViewPositionIndicator = new View[5];
            mViewPositionIndicator[0] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_0);
            mViewPositionIndicator[1] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_1);
            mViewPositionIndicator[2] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_2);
            mViewPositionIndicator[3] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_3);
            mViewPositionIndicator[4] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_4);
            for (View v : mViewPositionIndicator)
                v.setAlpha(INDICATOR_INACTIVE);

            mRelativeLayoutToolbar.findViewById(R.id.tv_intro_continue).setOnClickListener(new View.OnClickListener()
            {
                @Override
                public void onClick(View v)
                {
                    Intent mainMenuIntent = new Intent(IntroActivity.this, MainActivity.class);
                    startActivity(mainMenuIntent);
                    finish();
                }
            });

        }
    }

    @Override
    public void onSaveInstanceState(Bundle outState)
    {
        super.onSaveInstanceState(outState);

        outState.putByte(ARG_CURRENT_PAGE, mCurrentFeaturePage);
        outState.putBoolean(ARG_SELECTING_LANGUAGE, mIsSelectingLanguage);
    }

    @Override
    public void onLanguageSelected(boolean isEnglish)
    {
        getSharedPreferences(Constants.PREFERENCES, MODE_PRIVATE)
                .edit()
                .putBoolean(Constants.PREF_LANG, isEnglish)
                .commit();

        mIsSelectingLanguage = false;
        mIgnoreSelectingLanguage = true;
        updateIndicatorPosition(0);
        mRelativeLayoutToolbar.setVisibility(View.VISIBLE);
        mPagerAdapter.notifyDataSetChanged();
    }

    /**
     * Changes the color of views which indicate user's navigation in the view pager. Unhighlights
     * the last position, then highlights the new position.
     *
     * @param position new position to be highlighted
     */
    private void updateIndicatorPosition(int position)
    {
        //Changes which page indicator is 'highlighted'
        mViewPositionIndicator[mCurrentFeaturePage].setAlpha(INDICATOR_INACTIVE);
        mViewPositionIndicator[position].setAlpha(INDICATOR_ACTIVE);

        mCurrentFeaturePage = (byte)position;
    }

    /**
     * Manages which fragments will be displayed in the activity's view pager
     */
    private class IntroPagerAdapter extends FragmentStatePagerAdapter
    {
        SparseArray<WeakReference<Fragment>> registeredFragments = new SparseArray<>();

        /**
         * Default constructor
         *
         * @param fm fragment manager
         */
        public IntroPagerAdapter(FragmentManager fm)
        {
            super(fm);
        }

        @Override
        public Fragment getItem(int position)
        {
            //Once the user has selected a language, the screen should be inaccessible
            if (mIsSelectingLanguage)
                return LanguageFragment.newInstance();
            else
                return FeatureFragment.newInstance((byte)position);
        }

        @Override
        public Object instantiateItem(ViewGroup container, int position)
        {
            Fragment fragment = (Fragment)super.instantiateItem(container, position);
            registeredFragments.put(position, new WeakReference<>(fragment));
            return fragment;
        }

        @Override
        public void destroyItem(ViewGroup container, int position, Object item)
        {
            super.destroyItem(container, position, item);
            registeredFragments.remove(position);
        }

        @Override
        public int getCount()
        {
            if (mIsSelectingLanguage)
                return 1;
            else
                return FeatureFragment.MAX_FEATURES;
        }

        @Override
        public int getItemPosition(Object item)
        {
            if (mIsSelectingLanguage || mIgnoreSelectingLanguage)
            {
                //Causes the language select fragment to be removed if the adapter is refreshed
                mIgnoreSelectingLanguage = false;
                return POSITION_NONE;
            }
            else
                return super.getItemPosition(item);
        }

        /**
         * Gets the fragment from the {@link SparseArray} at {@code position}
         * @param position key for the fragment
         * @return fragment at {@code position}
         */
        private Fragment getRegisteredFragment(int position)
        {
            return registeredFragments.get(position).get();
        }
    }
}
