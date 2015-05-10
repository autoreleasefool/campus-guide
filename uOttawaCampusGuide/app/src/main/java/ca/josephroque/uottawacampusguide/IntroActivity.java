package ca.josephroque.uottawacampusguide;

import android.content.Intent;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentStatePagerAdapter;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import ca.josephroque.uottawacampusguide.fragment.FeatureFragment;
import ca.josephroque.uottawacampusguide.fragment.LanguageFragment;

/**
 * Created by Joseph Roque on 15-05-09
 * <p/>
 * Handles first time interactions with the application, provides UI to allow the user to
 * select a language and explore the functionality of the app
 */

public class IntroActivity extends ActionBarActivity
    implements LanguageFragment.OnLanguageSelectListener,
        FeatureFragment.OnFeatureClosedListener
{

    private ViewPager mViewPager;
    private PagerAdapter mPagerAdapter;

    private boolean isSelectingLanguage = true;
    private boolean ignoreSelectingLanguage = false;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        boolean languageSelected = getSharedPreferences(Constants.PREFERENCES, MODE_PRIVATE).getBoolean(Constants.PREF_LANG, false);
        if (languageSelected)
        {
            Intent mainMenuIntent = new Intent(this, MainActivity.class);
            startActivity(mainMenuIntent);
            finish();
        }
        else
        {
            setContentView(R.layout.activity_intro);

            mViewPager = (ViewPager)findViewById(R.id.vp_intro);
            mPagerAdapter = new IntroPagerAdapter(getSupportFragmentManager());
            mViewPager.setAdapter(mPagerAdapter);
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

        isSelectingLanguage = false;
        ignoreSelectingLanguage = true;
        mPagerAdapter.notifyDataSetChanged();
    }

    @Override
    public void onFeatureClosed()
    {

    }

    private class IntroPagerAdapter extends FragmentStatePagerAdapter
    {
        public IntroPagerAdapter(FragmentManager fm)
        {
            super(fm);
        }

        @Override
        public Fragment getItem(int position)
        {
            if (isSelectingLanguage)
                return LanguageFragment.newInstance();
            else
                return FeatureFragment.newInstance((byte)position);
        }

        @Override
        public int getCount()
        {
            if (isSelectingLanguage)
                return 1;
            else
                return FeatureFragment.getMaxFeatures();
        }

        @Override
        public int getItemPosition(Object item)
        {
            if (isSelectingLanguage || ignoreSelectingLanguage)
            {
                ignoreSelectingLanguage = false;
                return POSITION_NONE;
            }
            else
                return super.getItemPosition(item);
        }
    }
}
