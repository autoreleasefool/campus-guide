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

    private PagerAdapter mPagerAdapter;

    private RelativeLayout mRelativeLayoutToolbar;
    private View[] mViewPositionIndicator;

    private boolean mIsSelectingLanguage = true;
    private boolean mIgnoreSelectingLanguage = false;
    private byte mCurrentFeaturePage = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

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
            setContentView(R.layout.activity_intro);

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
                    Toast.makeText(IntroActivity.this, "Continued", Toast.LENGTH_SHORT).show();
                }
            });

        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu)
    {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_intro, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item)
    {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings)
        {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onResume()
    {
        super.onResume();
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
                return FeatureFragment.getMaxFeatures();
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
