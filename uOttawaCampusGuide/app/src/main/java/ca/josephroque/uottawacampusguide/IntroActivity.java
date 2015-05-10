package ca.josephroque.uottawacampusguide;

import android.content.Intent;
import android.graphics.drawable.Drawable;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.RelativeLayout;
import android.widget.Toast;

import ca.josephroque.uottawacampusguide.fragment.FeatureFragment;
import ca.josephroque.uottawacampusguide.fragment.LanguageFragment;
import ca.josephroque.uottawacampusguide.utility.Compatibility;

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

    /** Adapter to manage fragments displayed by this activity */
    private PagerAdapter mPagerAdapter;

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
                    updateIndicatorPosition(position);
                }
            });

            mRelativeLayoutToolbar = (RelativeLayout)findViewById(R.id.rl_intro_toolbar);
            mRelativeLayoutToolbar.setVisibility(View.GONE);

            mViewPositionIndicator = new View[5];
            mViewPositionIndicator[0] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_0);
            mViewPositionIndicator[1] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_1);
            mViewPositionIndicator[2] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_2);
            mViewPositionIndicator[3] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_3);
            mViewPositionIndicator[4] = mRelativeLayoutToolbar.findViewById(R.id.view_indicator_4);

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
        Drawable inactiveDrawable = getResources().getDrawable(R.drawable.position_indicator_inactive);
        Drawable activeDrawable = getResources().getDrawable(R.drawable.position_indicator_active);

        Compatibility.setViewBackgroundDrawable(mViewPositionIndicator[mCurrentFeaturePage], inactiveDrawable);
        Compatibility.setViewBackgroundDrawable(mViewPositionIndicator[position], activeDrawable);

        mCurrentFeaturePage = (byte)position;
    }

    /**
     * Manages which fragments will be displayed in the activity's view pager
     */
    private class IntroPagerAdapter extends FragmentStatePagerAdapter
    {
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
    }
}
