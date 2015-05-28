package ca.josephroque.uottawacampusnavigator.adapter;

import android.graphics.PorterDuff;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import ca.josephroque.uottawacampusnavigator.R;

/**
 * Created by Joseph Roque on 15-05-25.
 * <p/>
 * Manages data which will be displayed by the Navigation Drawer
 */
public class DrawerAdapter extends RecyclerView.Adapter<DrawerAdapter.DrawerViewHolder>
	implements View.OnClickListener
{

    /** Indicates the type of the item is header. */
    private static final int TYPE_HEADER = 0;
    /** Indicates the type of the item is a regular item. */
    private static final int TYPE_ITEM = 1;
	/** Indicates the type of the item is a category separator. */
	private static final int TYPE_SEPARATOR = 2;

    /** Instance of callback interface for user events. */
    private DrawerAdapterCallbacks mCallback;

    /** Array of image ids to display as icons for drawer items. */
    private int[] mArrayItemIcons;
	/** Array of colors to highlight selected icon */
	private int[] mArrayItemHighlights;
    /** Array of strings to display as names for drawer items. */
    private String[] mArrayItemNames;

    /**
     * Assigns references to parameters
     *
     * @param callback instance of callback interface
     * @param itemIcons array of image ids
     * @param itemNames array of strings
     */
    public DrawerAdapter(DrawerAdapterCallbacks callback, int[] itemIcons, int[] itemHighlights, String[] itemNames)
    {
        this.mCallback = callback;
        this.mArrayItemIcons = itemIcons;
		this.mArrayItemHighlights = itemHighlights;
        this.mArrayItemNames = itemNames;
    }

    @Override
    public DrawerViewHolder onCreateViewHolder(ViewGroup parent, int viewType)
    {
        View itemLayout;
        if (viewType == TYPE_HEADER)
        {
            itemLayout = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.header_navigation_drawer, parent, false);
        }
        else
        {
            itemLayout = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.list_navigation_drawer, parent, false);
        }
        return new DrawerViewHolder(itemLayout, viewType);
    }

    @Override
    public void onBindViewHolder(DrawerViewHolder viewHolder, final int position)
    {
        int viewType = getItemViewType(position);
		
		// Counts how many items are NOT regular items above this one
		final byte typeOffset = getTypeOffset(position);

        switch (viewType)
        {
            case TYPE_HEADER:
                //do nothing
                break;
			case TYPE_SEPARATOR:
				// Creates a simple view and sets its background color to be a separator
				// for the items
				viewHolder.mViewSeparator.setVisibility(View.VISIBLE);
				viewHolder.mTextViewItemName.setVisibility(View.GONE);
				viewHolder.mImageViewItemIcon.setVisibility(View.GONE);
				
				// Setting item padding
				final Resources resources = viewHolder.itemView.getContext().getResources();
				final float screenDensity = DataFormatter.getScreenDensity(resources);
				final int padding = DataFormatter.getPixelsFromDP(screenDensity, 1);
				viewHolder.itemView.setPadding(0, padding, 0, padding);
				break;
            case TYPE_ITEM:
				viewHolder.mViewSeparator.setVisibility(View.GONE);
				viewHolder.mTextViewItemName.setVisibility(View.VISIBLE);
				viewHolder.mImageViewItemIcon.setVisibility(View.VISIBLE);
				
				// Setting item padding
				final Resources resources = viewHolder.itemView.getContext().getResources();
				final float screenDensity = DataFormatter.getScreenDensity(resources);
				final int padding = DataFormatter.getPixelsFromDP(screenDensity,
								resources.getDimension(R.dimen.recyclerview_padding));
				viewHolder.itemView.setPadding(0, padding, 0, padding);
				
                viewHolder.mTextViewItemName.setText(mArrayItemNames[position - typeOffset]);
				
				// Set icon to the image resource given for this position if one was provided
				// otherwise, use a default image (settings)
				if (mArrayItemIcons.length > position - typeOffset)
				{
                    viewHolder.mImageViewItemIcon.setVisibility(View.VISIBLE);
					viewHolder.mImageViewItemIcon.setImageResource(mArrayItemIcons[position - 1]);
				}
				else
				{
					viewHolder.mImageViewItemIcon.setVisibility(View.INVISIBLE);
					viewHolder.mImageViewItemIcon.setImageResource(R.drawable.ic_settings);
				}
				
				//Highlights the image if it is the currently selected item
				if (mArrayItemHighlights.length > position - typeOffset && mCallback != null
						&& position == mCallback.getCurrentPosition() + typeOffset)
				{
					viewHolder.mImageViewItemIcon.setColorFilter(mArrayItemHighlights[position - 1],
							PorterDuff.Mode.MULTIPLY);
				}
				else
				{
					viewHolder.mImageViewItemIcon.clearColorFilter();
				}
				
				viewHolder.itemView.setTag(Pair.create(position, typeOffset));
                viewHolder.itemView.setOnClickListener(this);
                break;
            default:
                throw new IllegalStateException("Illegal value for view type: " + viewType);
        }
    }

    @Override
    public int getItemViewType(int position)
    {
		if (position == 0)
			return TYPE_HEADER;
		else if (position == getTypeOffset(position) + Constants.NAVIGATION_ITEM_SETTINGS - 1)
			return TYPE_SEPARATOR;
        else
			return TYPE_ITEM;
    }

    @Override
    public int getItemCount()
    {
        return mArrayItemNames.length + 1;
    }
	
	@Override
	public void onClick(View src)
	{
		Pair<Integer, Integer> pair = null;
		try
		{
			pair = (Pair<Integer, Integer>) src.getTag();
		}
		catch (ClassCastException ex)
		{
			throw new ClassCastException("Tag must be a pair<int, int> with a position and offset");
		}
		
		if (pair == null)
			return;
		
		final int position = pair.first;
		final int typeOffset = pair.second;
		
		if (mCallback != null)
		{
			int lastPosition = mCallback.getCurrentPosition() + typeOffset;
			if (position != lastPosition)
			{
				notifyItemChanged(mCallback.getCurrentPosition() + typeOffset);
				notifyItemChanged(position);
			}
			mCallback.onDrawerItemClicked(position - typeOffset);
		}
	}
	
	private byte getTypeOffset(int position)
	{
		byte typeOffset = 0;
		for (int ii = 0; ii < position; ii++)
		{
			if (getItemViewType(ii) != TYPE_ITEM)
				typeOffset++;
		}
		return typeOffset;
	}

    /**
     * Offers methods for sending events to the navigation drawer which uses this adapter.
     */
    public interface DrawerAdapterCallbacks
    {
        /**
         * Called when an item in the drawer is clicked, so the parent fragment can handle
         * the user interaction.
         * @param position view which was clicked.
         */
        void onDrawerItemClicked(int position);
		
		/**
		 * Should return the current item which is highlighted in the navigation drawer.
		 
		 * @return a value which indicates the current position in navigation.
		 */
		int getCurrentPosition();
    }

    /**
     * Subclass of RecyclerView.ViewHolder to manage view which will display an image
     * and text to the user.
     */
    public static class DrawerViewHolder extends RecyclerView.ViewHolder
    {
        /** ImageView for icon of list item. */
        private ImageView mImageViewItemIcon;
        /** TextView for name of list item. */
        private TextView mTextViewItemName;
		/** View to display an item separator */
		private View mViewSeparator;

        /**
         * Calls super constructor with {@code itemLayout} as parameter and gets references
         * for member variables from {@code itemLayou}.
         *
         * @param itemLayout root layout
         * @param viewType type of view holder
         */
        public DrawerViewHolder(View itemLayout, int viewType)
        {
            super(itemLayout);

            if (viewType != TYPE_HEADER)
            {
                mImageViewItemIcon = (ImageView) itemLayout.findViewById(R.id.iv_navigation_item_icon);
                mTextViewItemName = (TextView) itemLayout.findViewById(R.id.tv_navigation_item_name);
				mViewSeparator = itemLayout.findViewById(R.id.view_separator);
            }
        }
    }
}
